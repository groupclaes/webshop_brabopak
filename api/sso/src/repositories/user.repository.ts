import sql from 'mssql'
import * as jose from 'jose'
import db from '../db'

import config from './config'
import { SSO } from './sso.repository'

const expiresIn = 900
const DB_NAME = 'brabopak'

export default class User {
  schema: string = '[sso]'
  sso: SSO

  constructor() {
    this.sso = new SSO()
  }
  /**
   * 
   */
  async getIdToken(authorization_code: { user_id: string, scope: string }): Promise<string> {
    const { audience, subject } = this.getAudSub(authorization_code.user_id)
    const userinfo = await this.sso.getUserInfo(authorization_code.user_id)

    let payload: any
    const scopes = authorization_code.scope.split(' ')
    // extract required data base on authorization_code.scope

    for (const [key, value] of Object.entries(userinfo)) {
      if (!payload)
        payload = {}
      if (scopes.indexOf(key) !== -1)
        payload[key] = value
    }

    if (!payload)
      throw new Error('Invalid payload')

    const privateKey = await jose.importJWK(config.key)
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.jku })
      .setIssuer(config.key.iss)
      .setAudience(audience)
      .setExpirationTime(expiresIn + 's')
      .setSubject(subject)
      .sign(privateKey)
  }

  async getAccessToken(authorization_code) {
    const { audience, subject } = this.getAudSub(authorization_code.user_id)

    const privateKey = await jose.importJWK(config.key)
    return await new jose.SignJWT({ roles: ['*'] })
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.jku })
      .setIssuer(config.key.iss)
      .setAudience(audience)
      .setExpirationTime(expiresIn + 's')
      .setSubject(subject)
      .sign(privateKey)
  }

  /**
   * Create a new refresh token for user_id
   */
  getRefreshToken(user_id: string, code: string, access_token: string): Promise<any> {
    return this.sso.createRefreshToken(
      user_id,
      code,
      access_token
    )
  }

  /**
   * Update `password` for id: `user_id`
   * @returns
   */
  updatePassword = (user_id: string, password: string) => this.sso.updatePassword(user_id, password)

  /**
   *
   */
  async create(email: string, password: string, given_name: string, family_name: string): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('email', sql.VarChar, email)
    request.input('password', sql.VarChar, password)
    request.input('given_name', sql.VarChar, given_name)
    request.input('family_name', sql.VarChar, family_name)

    const result = await request.execute(`${this.schema}.[usp_createUser]`)

    if (result.rowsAffected[0] > 0) {
      return true
    }
    return false
  }

  /**
   * get audience and subject for jwt
   * @param user_id id of the user
   * @returns 
   */
  getAudSub = (user_id: number | string) => ({
    audience: [
      config.key.iss
    ],
    subject: user_id.toString()
  })
}
