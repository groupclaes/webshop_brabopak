import bcrypt from 'bcrypt'
import { JWTPayload } from 'jose'
import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'
import { success, fail, error } from '@groupclaes/fastify-elastic/responses'
import oe from '@groupclaes/oe-connector'

import User from '../repositories/user.repository'
// SGWQVXPQWZEM

/**
 * Create new user if it exists in azure
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const postSignOn = async (request: FastifyRequest<{
  Body: {
    username: string,
    password: string,
    code: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new User()
    const {
      username,
      password,
      code
    } = request.body

    oe.configure({
      c: false
    })

    const user = await repo.sso.get(username)
    if (user) {
      request.log.warn({ username, code, reason: 'user already exists' }, 'Failed to register!')
      return reply
        .status(403)
        .send({
          status: 'fail',
          code: 403,
          message: 'user already exists'
        })
    }

    const oeResponse = await oe.run('signon', [
      username,
      code,
      'BRA',
      undefined
    ], {
      tw: -1,
      simpleParameters: true
    })

    if (oeResponse && oeResponse.status === 200 && oeResponse.result) {
      const result = (oeResponse.result.settings as IAppUser[])
      if (result && result.length > 0) {
        const appuser = result[0]
        if (await repo.create(username, bcrypt.hashSync(password, +(env['BCRYPT_COST'] ?? 13)), appuser.usercode)) {
          // insert/update user.settings
          await repo.checkSettings(appuser)

          request.log.debug({ username, code }, 'User successfully registered!')
          return {
            status: 'success',
            code: 200,
            data: {
              success: true
            }
          }
        }
        request.log.debug({ username, code, reason: 'error while creating new user entry' }, 'Failed to register user!')
        return reply
          .status(500)
          .send({
            status: 'error',
            code: 500,
            message: 'error while creating new user entry'
          })
      }
      request.log.debug({ username, code, reason: 'error with usersettings!' }, 'Failed to register user!')
      return reply
        .status(500)
        .send({
          status: 'error',
          code: 500,
          message: 'error with usersettings!'
        })
    } else {
      request.log.debug({ username, code, reason: 'error while retrieving registration info!' }, 'Failed to register user!')
      return reply
        .status(500)
        .send({
          status: 'error',
          code: 500,
          message: 'error while retrieving registration info!'
        })
    }
  } catch (err) {
    request.log.debug({ reason: 'unknown error', err }, 'Failed to register user!')
    return error(reply, 'failed to register user')
  }
}

/**
 * Revoke current or supplied refreshToken
 */
export const postRevokeToken = async (request: FastifyRequest, reply: FastifyReply) => {
  return fail(reply, { reason: 'Method not implemented' })
}

/**
 * Renew current refreshToken
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const postRefreshToken = async (request: FastifyRequest<{
  Querystring: {
    token: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new User()
    const token = request.query.token
    const refreshToken = await repo.sso.getRefreshToken(token)

    if (!refreshToken) {
      return reply
        .code(403)
        .send({
          error: `This refresh token does not exist!`
        })
    }

    // get AuthorizationCode Details
    const authorization_code = await repo.sso.getAuthorizationCode(refreshToken.authorization_code)
    if (!authorization_code)
      return

    const access_token = await repo.getAccessToken(authorization_code)
    const id_token = await repo.getIdToken(authorization_code)

    let payload = {
      access_token,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      id_token: id_token
    }

    const newToken = await repo.sso.updateRefreshToken(token)

    if (newToken) {
      return {
        ...payload,
        refresh_token: newToken
      }
    } else {
      return reply
        .code(403)
        .send({
          error: `This refresh token has been revoked/expired!`
        })
    }
  } catch (err) {
    throw err
  }
}

/**
 * Update user password
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const postUpdatePassword = async (request: FastifyRequest<{
  Body: {
    password: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new User()
    const token: JWTPayload = request['token'] || { sub: null }

    if (token.sub) {
      const body = request.body
      let _pass = body.password

      _pass = bcrypt.hashSync(_pass, +(env['BCRYPT_COST'] ?? 13))
      return await repo.updatePassword(token.sub, _pass)
    }
    return
  } catch (err) {
    request.log.error({ err }, 'error while updating password')
    return error(reply, 'error while updating password')
  }
}

/**
 * Request user password reset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const postRequestPasswordReset = async (request: FastifyRequest<{
  Body: {
    username: string
    password?: string
  },
  Querystring: {
    reset_token?: string
  }
}>, reply: FastifyReply) => {
  let ip_address = '127.0.0.1'
  let client_ip = request.headers['x-client-ip']
  if (typeof client_ip === 'string') {
    ip_address = client_ip.split(',')[0]
  } else if (client_ip) {
    ip_address = client_ip[0].split(',')[0]
  }

  try {
    const repo = new User()

    const user = await repo.sso.get(request.body.username)

    if (!user?.active)
      return fail(reply, { username: 'account not found!' })

    if (request.query.reset_token) {
      // user is completing password reset using reset_token
      const user_id = await repo.sso.getResetToken(request.query.reset_token)

      if (!user_id)
        return fail(reply, { reset_token: 'token not found!' })

      if (!request.body.password)
        return fail(reply, { password: 'missing in payload' })

      const hashed_password = bcrypt.hashSync(request.body.password, +(env['BCRYPT_COST'] ?? 13))

      if (await repo.updatePassword(user_id, hashed_password)) {
        await repo.sso.revokeResetToken(request.query.reset_token, ip_address, 'used')
        return success(reply, { success: true })
      }

      return error(reply, 'failed to update password in db')
    } else {
      // user is requesting a new reset_token
      const token = await repo.sso.createResetToken(user.id.toString(), ip_address)

      if (!token)
        return error(reply, 'error creating new reset token')

      return success(reply, { success: true, token })
    }
    // return fail(reply, { username: 'mallformed username supplied' })
  } catch (err) {
    request.log.error({ err }, 'error while requesting password reset')
    return error(reply, 'error while requesting password reset')
  }
}

export const getCustomers = async (request: FastifyRequest<any>, reply: FastifyReply) => {
  const start = performance.now()

  try {
    const repo = new User()
    const token: JWTPayload = request['token']

    if (token.sub) {
      const customers = await repo.getCustomers(token.sub)
      
      if (customers?.length ?? 0 > 0)
        return success(reply, { customers }, 200, performance.now() - start)
      return success(reply, { customers: [] }, 200, performance.now() - start)
    }
    return fail(reply, { token: 'precondition failed' })
  } catch (err) {
    request.log.error({ err }, 'could not fetch customers')
    return error(reply, 'could not fetch customers')
  }
}

export interface IAppUser {
  usercode: number
  user_type: 1 | 2 | 3 | 4
  customer_id: number
  address_id: number
  group_id: number
  promo: boolean
  bonus_percentage: number
  fostplus: boolean
  customer_type: number
  price_class: number
}