import bcrypt from 'bcrypt'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'
import oe from '@groupclaes/oe-connector'

import User from '../repositories/user.repository'
import { JWTPayload } from 'jose'
const AAD = require('../providers/aad')
// SGWQVXPQWZEM

declare module 'fastify' {
  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
     * Create new user if brabopak.com, check if exists in azure
     * @route /users/signon
     */
  fastify.post('/signon', async (request: FastifyRequest<{
    Body: {
      username: string
      password: string
      given_name: string
      family_name: string
      phone_number?: string
      code: string
    }
  }>, reply) => {
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

      if (username.includes('brabopak.com')) {
        /** @type {any[]} */
        const users = AAD.getAllUsers()
        const user = users.find((u) => u.userPrincipalName.toLowerCase() === username && u.department)
        if (!user) {
          request.log.warn({ username, code, reason: 'user is not a valid brabopak employee' }, 'Failed to register!')
          return reply
            .status(403)
            .send({
              status: 'fail',
              code: 403,
              message: 'user is not a valid brabopak employee'
            })
        }
      }

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
        tw: 3000,
        simpleParameters: true
      })

      if (oeResponse && oeResponse.status === 200 && oeResponse.result) {
        const result = (oeResponse.result.settings as IAppUser[])
        if (result && result.length > 0) {
          const appuser = result[0]
          if (await repo.create(username, bcrypt.hashSync(password, +(env['BCRYPT_COST'] ?? 13)), request.body.given_name, request.body.family_name, appuser.usercode)) {
            // insert/update user.settings
            await repo.checkSettings(appuser)

            request.log.info({ username, code }, 'User successfully registered!')
            return reply.success({ success: true })
          }
          request.log.error({ username, code, reason: 'error while creating new user entry' }, 'Failed to register user!')
          return reply.fail('error while creating new user entry', 403)
        }
        request.log.error({ username, code, reason: 'error with usersettings!' }, 'Failed to register user!')
        return reply.fail('error with usersettings!', 404)
      } else {
        request.log.error({ username, code, reason: 'error while retrieving registration info!', oe: oeResponse.result }, 'Failed to register user!')
        return reply.fail('error while retrieving registration info!', 404)
      }
    } catch (err) {
      request.log.error({ reason: 'unknown error', err }, 'Failed to register user!')
      return reply.error('failed to register user')
    }
  })

  /**
   * Revoke current or supplied refreshToken
   */
  fastify.post('/revoke-token', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.fail({ reason: 'Method not implemented' })
  })

  /**
   * Renew current refreshToken
   * @param {FastifyRequest} request
   * @param {FastifyReply} reply
   */
  fastify.post('/refresh-token', async (request: FastifyRequest<{
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
      request.log.error({ error: err, authorizationCode: request.query.token }, 'Couldn\'t retrieve token, something unexpected happened')
      return reply
        .code(500)
        .send({
          status: 'error',
          code: 500,
          message: `Something unexpected happened while refreshing token!`
        })
    }
  })

  /**
   * Update user password
   * @param {FastifyRequest} request
   * @param {FastifyReply} reply
   */
  fastify.post('/update-password', async (request: FastifyRequest<{
    Body: {
      password: string
    }
  }>, reply: FastifyReply) => {
    try {
      const repo = new User()

      if (request.jwt?.sub) {
        const body = request.body
        let _pass = body.password

        _pass = bcrypt.hashSync(_pass, +(env['BCRYPT_COST'] ?? 13))
        return await repo.updatePassword(request.jwt?.sub, _pass)
      }
      return
    } catch (err) {
      request.log.error({ err }, 'error while updating password')
      return reply.error('error while updating password')
    }
  })

  /**
   * Request user password reset
   * @param {FastifyRequest} request
   * @param {FastifyReply} reply
   */
  fastify.post('/reset-password', async (request: FastifyRequest<{
    Body: {
      username: string
      password?: string
    },
    Querystring: {
      reset_token?: string
      culture?: string
    }
  }>, reply: FastifyReply) => {
    let ip_address = '127.0.0.1'
    let client_ip = request.headers['x-client-ip']
    if (typeof client_ip === 'string') {
      ip_address = client_ip.split(',')[0]
    } else if (client_ip) {
      ip_address = client_ip[0].split(',')[0]
    }

    const culture = request.query.culture ?? 'nl'
    request.log.debug({ reset_token: request.query.reset_token, username: request.body.username }, 'request pasword reset')

    try {
      const repo = new User()

      const user = await repo.sso.get(request.body.username)

      if (!user?.active)
        return reply.fail({ username: 'account not found!' })

      if (request.query.reset_token) {
        // user is completing password reset using reset_token
        const user_id = await repo.sso.getResetToken(request.query.reset_token)

        if (!user_id)
          return reply.fail({ reset_token: 'token not found!' })

        if (!request.body.password)
          return reply.fail({ password: 'missing in payload' })

        const hashed_password = bcrypt.hashSync(request.body.password, +(env['BCRYPT_COST'] ?? 13))

        if (await repo.updatePassword(user_id, hashed_password)) {
          await repo.sso.revokeResetToken(request.query.reset_token, ip_address, 'used')
          return reply.success({ success: true })
        }

        return reply.error('failed to update password in db')
      } else {
        // user is requesting a new reset_token
        const token = await repo.sso.createResetToken(user.id.toString(), ip_address)

        if (!token)
          return reply.error('error creating new reset token')

        // send with token to user
        await repo.sendResetToken(user.username, user.given_name, token, culture)

        return reply.success({ success: true })
      }
      // return fail(reply, { username: 'mallformed username supplied' })
    } catch (err) {
      request.log.error({ err }, 'error while requesting password reset')
      return reply.error('error while requesting password reset')
    }
  })

  fastify.get('/customers', async (request: FastifyRequest<any>, reply: FastifyReply) => {
    const start = performance.now()

    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const repo = new User()

      if (request.jwt.sub) {
        const customers = await repo.getCustomers(request.jwt.sub)

        if (customers?.length ?? 0 > 0)
          return reply.success({ customers }, 200, performance.now() - start)
        return reply.success({ customers: [] }, 200, performance.now() - start)
      }
      return reply.fail({ token: 'precondition failed' })
    } catch (err) {
      request.log.error({ err }, 'could not fetch customers')
      return reply.error('could not fetch customers')
    }
  })
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