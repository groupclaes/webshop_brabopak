import bcrypt from 'bcrypt'
import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'

import config from './config'
import User from '../repositories/user.repository'

import verify from '../providers/google-recaptcha'
import { PasswordPolicy } from '../providers/password-policy'
import { MFA } from '../providers/mfa'
import { getImpersonation, getTrustRating } from '../tools'

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

    let _impersonatedUser: undefined | string

    let username = request.body.username.toLowerCase()
    let password = request.body.password

    let ip_address = '127.0.0.1'
    let client_ip = request.headers['x-client-ip']
    if (typeof client_ip === 'string') {
      ip_address = client_ip.split(',')[0]
    } else if (client_ip) {
      ip_address = client_ip[0].split(',')[0]
    }
    const user_agent = request.headers['user-agent']
    const rating = getTrustRating(user_agent)
    // const redirect_uri = request.query.redirect_uri

    if (!request.query.response_type) return badRequest(request, reply, 'parameter \'response_type\' not specified!')
    if (request.query.response_type !== 'code') return badRequest(request, reply, 'invalid \'response_type\' specified!')
    if (!request.query.scope) return badRequest(request, reply, 'parameter \'scope\' not specified!')
    if (!request.query.client_id) return badRequest(request, reply, 'parameter \'client_id\' not specified!')

    const recaptcha = request.headers['g-recaptcha-response']
    if (recaptcha) {
      try {
        // Check recaptcha
        const result = await verify(recaptcha.toString(), 'login')
        if (!result)
          return await failedAuth(request, reply, repo, 403, 'Bot detected!', username, null, false, 0, 'Bot detected!', ip_address, rating, user_agent)
      } catch (err) {
        request.log.warn({ username, reason: 'Failed to verify reCAPTCHA!', err }, 'Failed to authenticate!')
      }
    } else
      return await failedAuth(request, reply, repo, 403, 'No reCAPTCHA challenge!', username, null, false, 0, 'No reCAPTCHA challenge!', ip_address, rating, user_agent)

    const impersonation = getImpersonation(username)
    if (impersonation) {
      username = impersonation.username
      _impersonatedUser = impersonation.impersonated_user
    }

    let failedAttempts = await repo.sso.getFailedAuthAttempts(null, ip_address)
    if (failedAttempts.ip.length >= 20)
      return await failedAuth(request, reply, repo, 429, 'too many failed attempts', username, null, false, 3, 'too many failed attempts', ip_address, rating, user_agent)


    const user = await repo.sso.get(username)
    if (!user)
      return await failedAuth(request, reply, repo, 404, 'Username or password is incorrect!', username, null, false, 0, 'wrong username', ip_address, rating, user_agent)

    failedAttempts = await repo.sso.getFailedAuthAttempts(user.id.toString(), null)
    if (failedAttempts.user.length >= 10)
      return await failedAuth(request, reply, repo, 429, 'too many failed attempts', username, user.id.toString(), false, 2, 'too many failed attempts', ip_address, rating, user_agent)

    if (!user.active)
      return await failedAuth(request, reply, repo, 404, 'Username or password is incorrect!', username, user.id.toString(), false, 0, 'user is inactive', ip_address, rating, user_agent)

    // check password
    if (bcrypt.compareSync(password, user.password)) {
      // user has bcrypt password
    } else if (password === user.password)
      // user is using plaintext password
      await repo.updatePassword(user.id.toString(), bcrypt.hashSync(password, +((env['BCRYPT_COST']) ?? 13)))
    else
      return await failedAuth(request, reply, repo, 404, 'Username or password is incorrect!', username, user.id.toString(), false, 0, 'wrong password', ip_address, rating, user_agent)

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

    let impersonated_user: undefined | any

    if (_impersonatedUser !== undefined)
      impersonated_user = await repo.sso.get(_impersonatedUser)

    let authorization_code
    let mfa_required
    if (request.body.mfa_code === undefined) {
      authorization_code = await repo.sso.createAuthorizationCode(request.query.client_id, impersonated_user ?? user.id.toString(), request.query.scope)
      const mfa = new MFA(user, request.query.client_id, { authorization_code })
      if (mfa.challengeRequired() === true) {
        mfa_required = true
        await mfa.challenge()
      }
    } else {
      // Get mfa info by code
      const mfa_info = await repo.sso.getMfaInfo(request.body.mfa_code)
      if (mfa_info) {
        if (!mfa_info.used) {
          const mfa = new MFA(user, request.query.client_id, mfa_info)
          if (mfa.complete(request.body.mfa_code)) {
            await mfa.use(request.body.mfa_code)
            authorization_code = mfa_info.authorization_code
          }
        }
      } else {
        return await failedAuth(request, reply, repo, 404, 'Username or password is incorrect!', username, user.id.toString(), false, 0, 'mfa_info missing', ip_address, rating, user_agent)
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

function badRequest(request: FastifyRequest, reply: FastifyReply, error: string): FastifyReply {
  request.log.warn(error)
  return reply
    .code(400)
    .send({
      error: error
    })
}

async function failedAuth(request: FastifyRequest, reply: FastifyReply, repo: User, code: number, error: string, username: string, user_id?: string | null, success: boolean = false, result: number = 0, reason: null | string = null, ip: null | string = '127.0.0.1', rating: number = 50, user_agent: null | string = null) {
  await repo.sso.addAuthLog(user_id, success, result, reason, ip, rating, user_agent)
  request.log.warn({ username, reason }, 'Failed to authenticate!')
  return reply
    .code(code)
    .send({ error })
}