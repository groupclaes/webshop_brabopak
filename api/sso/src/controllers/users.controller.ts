import bcrypt from 'bcrypt'
import { JWTPayload } from 'jose'
import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from 'process'
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
          return {
            success: true
          }
        }
        return reply
          .status(500)
          .send({
            status: 'Internal Server Error',
            statusCode: 500,
            message: 'Error while creating new user entry!'
          })
      }
      return reply
        .status(500)
        .send({
          status: 'Internal Server Error',
          statusCode: 500,
          message: 'Error with usersettings!'
        })
    } else {
      return reply
        .status(500)
        .send({
          status: 'Internal Server Error',
          statusCode: 500,
          message: 'Error while retrieving registration info!'
        })
    }
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Revoke current or supplied refreshToken
 */
export const postRevokeToken = async (request: FastifyRequest, reply: FastifyReply) => {

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
    throw err
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
  customer_type: string
  price_class: number
}