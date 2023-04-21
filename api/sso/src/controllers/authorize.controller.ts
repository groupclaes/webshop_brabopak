import bcrypt from 'bcrypt'
import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'

import User from '../repositories/user.repository'

// https://shop.brabopak.com/api/v1/sso/authorize?response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
/**
 *
 */
export const post = async (request: FastifyRequest<{
  Body: {
    username: string,
    password: string
  },
  Querystring: {
    response_type: string,
    scope: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new User()

    const username = request.body.username
    const password = request.body.password

    const response_type = request.query.response_type
    const scope = request.query.scope

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
    if (user === null) {
      await repo.sso.addAuthLog(null, false, 0, 'wrong username', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong username' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    failedAttempts = await repo.sso.getFailedAuthAttempts(user?.id.toString(), null)
    if (failedAttempts.user.length >= 10) {
      await repo.sso.addAuthLog(user?.id.toString(), false, 2, 'too many failed attempts', ip_address, rating, user_agent)
      return reply
        .code(429)
        .send({
          reason: 'too many failed attempts'
        })
    }

    if (!user?.active) {
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
      await repo.updatePassword(user.id.toString(), bcrypt.hashSync(password, env['BCRYPT_COST'] ?? 13))
    } else {
      await repo.sso.addAuthLog(user.id.toString(), false, 0, 'wrong password', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong password' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    let errors = []

    let authorization_code = await repo.sso.createAuthorizationCode(user.id.toString(), scope)

    return {
      authorization_code,
      errors
    }
  } catch (err) {
    throw err
  }
}