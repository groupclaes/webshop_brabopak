import bcrypt from 'bcrypt'
import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'

import config from './config'
import User from '../repositories/user.repository'

import verify from '../providers/google-recaptcha'
import { PasswordPolicy } from '../providers/password-policy'
import { MFA } from '../providers/mfa'

// https://shop.brabopak.com/api/v1/sso/authorize?response_type=code&scope=openid&client_id=hBK4c2uZK5&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
/**
 *
 */
export const post = async (request: FastifyRequest<{
  Body: {
    username: string,
    password: string
    mfa_code?: string
  },
  Querystring: {
    response_type: string,
    scope: string,
    client_id: string // hBK4c2uZK5
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new User()

    const username = request.body.username
    const password = request.body.password
    const mfa_code = request.body.mfa_code

    const response_type = request.query.response_type
    const scope = request.query.scope
    const client_id = request.query.client_id

    let ip_address = '127.0.0.1'
    let client_ip = request.headers['x-client-ip']
    if (typeof client_ip === 'string') {
      ip_address = client_ip.split(',')[0]
    } else if (client_ip) {
      ip_address = client_ip[0].split(',')[0]
    }
    const user_agent = request.headers['user-agent']
    let rating = 50
    if (user_agent &&
      !user_agent.includes('Mozilla') &&
      !user_agent.includes('Chrome') &&
      !user_agent.includes('Safari')) {
      rating = 20
    }
    // const redirect_uri = request.query.redirect_uri

    if (response_type !== 'code') {
      return reply
        .code(400)
        .send({
          error: `Invalid 'response_type' specified!`
        })
    }

    if (!scope) {
      return reply
        .code(400)
        .send({
          error: `Parameter 'scope' not specified!`
        })
    }

    const recaptcha = request.headers['g-recaptcha-response']
    if (recaptcha) {
      try {
        // Check recaptcha
        const result = await verify(recaptcha.toString(), 'login')
        if (!result) {
          await repo.sso.addAuthLog(null, false, 0, 'Bot detected!', ip_address, rating, user_agent)
          request.log.warn({ username, reason: 'Bot detected!' }, 'Failed to authenticate!')
          return reply
            .code(403)
            .send({
              error: 'Bot detected!'
            })
        }
      } catch (err) {
        request.log.warn({ username, reason: 'Failed to verify reCAPTCHA!', err }, 'Failed to authenticate!')
      }
    } else {
      // recaptcha is not required for backwards compatibility, will enable in feature release
    }

    let failedAttempts = await repo.sso.getFailedAuthAttempts(null, ip_address)
    if (failedAttempts.ip.length >= 20) {
      await repo.sso.addAuthLog(null, false, 3, 'too many failed attempts', ip_address, rating, user_agent)
      return reply
        .code(429)
        .send({
          reason: 'too many failed attempts'
        })
    }

    const user = await repo.sso.get(username)
    if (!user) {
      await repo.sso.addAuthLog(null, false, 0, 'wrong username', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong username' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    failedAttempts = await repo.sso.getFailedAuthAttempts(user.id.toString(), null)
    if (failedAttempts.user.length >= 10) {
      await repo.sso.addAuthLog(user?.id.toString(), false, 2, 'too many failed attempts', ip_address, rating, user_agent)
      return reply
        .code(429)
        .send({
          reason: 'too many failed attempts'
        })
    }

    if (!user.active) {
      await repo.sso.addAuthLog(user?.id.toString(), false, 0, 'user is inactive', ip_address, rating, user_agent)
      request.log.warn({ username }, 'Inactive user tried to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    // check password
    if (bcrypt.compareSync(password, user.password)) {
      // user has bcrypt password
    } else if (password === user.password) {
      // user is using plaintext password
      await repo.updatePassword(user.id.toString(), bcrypt.hashSync(password, +((env['BCRYPT_COST']) ?? 13)))
    } else {
      await repo.sso.addAuthLog(user.id.toString(), false, 0, 'wrong password', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong password' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }
    let errors: any[] = []
    if ('password_policy' in config) {
      // Audit password
      const policy = new PasswordPolicy(password, config.password_policy)

      try {
        policy.audit()
      } catch (err) {
        errors.push(err)
      }
    }

    let authorization_code
    let mfa_required
    if (mfa_code === undefined) {
      authorization_code = await repo.sso.createAuthorizationCode(client_id, user.id.toString(), scope)
      const mfa = new MFA(user, client_id, { authorization_code })
      if (mfa.challengeRequired() === true) {
        mfa_required = true
        await mfa.challenge()
      }
    } else {
      // Get mfa info by code
      const mfa_info = await repo.sso.getMfaInfo(mfa_code)
      if (mfa_info) {
        if (!mfa_info.used) {
          const mfa = new MFA(user, client_id, mfa_info)
          if (mfa.complete(mfa_code)) {
            await mfa.use(mfa_code)
            authorization_code = mfa_info.authorization_code
          }
        }
      } else {
        await repo.sso.addAuthLog(user.id.toString(), false, 0, 'mfa_info missing', ip_address, rating, user_agent)
        request.log.warn({ username, reason: 'mfa_info not found' }, 'Failed to authenticate!')
        return reply
          .code(404)
          .send({
            error: 'Username or password is incorrect!'
          })
      }
    }
    return {
      authorization_code: mfa_required === undefined ? authorization_code : undefined,
      mfa_required,
      errors
    }
  } catch (err) {
    throw err
  }
}