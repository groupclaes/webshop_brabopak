import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import User from '../repositories/user.repository'

// GET https://shop.brabopak.com/api/v1/sso/token?grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb=
/**
 * Get
 */
export default async function (fastify: FastifyInstance) {
  fastify.get('', async (request: FastifyRequest<{
    Querystring: {
      grant_type: string,
      code: string,
      redirect_uri: string
    }
  }>, reply: FastifyReply) => {
    const repo = new User()
    try {
      const grant_type = request.query.grant_type
      const code = request.query.code

      request.log.debug({ grant_type, code }, 'parameters for receiving a new token.')

      if (grant_type !== 'authorization_code') {
        request.log.warn('Invalid \'grant_type\' specified!')
        return reply
          .code(400)
          .send({
            status: 'error',
            code: 400,
            message: `Invalid 'grant_type' specified!`
          })
      }

      if (!code) {
        request.log.warn('Parameter \'code\' not specified!')
        return reply
          .code(400)
          .send({
            status: 'error',
            code: 400,
            message: `No 'code' supplied!`
          })
      }

      // get AuthorizationCode Details
      const authorization_code = await repo.sso.getAuthorizationCode(code)
      request.log.debug({ authorization_code }, 'requested authorization details for a new token.')

      if (!authorization_code) {
        request.log.warn('Invalid \'code\' specified!')
        return reply
          .code(404)
          .send({
            status: 'error',
            code: 404,
            message: `Invalid 'code' specified!`
          })
      }

      if (authorization_code.expires < new Date()) {
        request.log.warn('\'code\' has expired!')
        return reply
          .code(403)
          .send({
            status: 'error',
            code: 403,
            message: `'code' has expired!`
          })
      }

      const access_token = await repo.getAccessToken(authorization_code)
      const id_token = await repo.getIdToken(authorization_code)

      request.log.debug('created access_token and id_token')

      let payload: {
        access_token: string
        token_type: string
        expires_in: number
        id_token: string
        refresh_token?: string
      } = {
        access_token,
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes
        id_token,
      }

      try {
        if (authorization_code.scope.indexOf('offline_access') !== -1) {
          request.log.debug('refresh_token required as offline_access is requested')
          payload = {
            ...payload,
            refresh_token: await repo.getRefreshToken(
              authorization_code.user_id,
              code,
              access_token.split('.')[2]
            )
          }
        }
      } catch (err) {
        request.log.warn({ error: err, authorizationCode: request.query.code, grantType: request.query.grant_type, redirectUri: request.query.redirect_uri }, 'Couldn\'t create refresh token, something unexpected happened')
      }

      request.log.debug('returning payload')
      return payload
    } catch (err) {
      request.log.error({ error: err, authorizationCode: request.query.code, grantType: request.query.grant_type, redirectUri: request.query.redirect_uri }, 'Couldn\'t retrieve token, something unexpected happened')
      return reply
        .code(500)
        .send({
          status: 'error',
          code: 500,
          message: `Something unexpected happened!`
        })
    }
  })
}