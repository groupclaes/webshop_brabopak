import sql from 'mssql'
import * as jose from 'jose'
import db from '../db'

import config from './config'
import { SSO } from './sso.repository'
import { IAppUser } from '../controllers/users.controller'

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
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.iss })
      .setIssuer(config.key.iss)
      .setAudience(audience)
      .setExpirationTime(expiresIn + 's')
      .setSubject(subject)
      .sign(privateKey)
  }

  async getAccessToken(authorization_code: { user_id: string, scope: string }) {
    const { audience, subject } = this.getAudSub(authorization_code.user_id)

    const privateKey = await jose.importJWK(config.key)
    return await new jose.SignJWT({})
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.iss })
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
  async create(username: string, password: string, usercode: number): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('username', sql.VarChar, username)
    request.input('password', sql.VarChar, password)
    request.input('usercode', sql.Int, usercode)

    const result = await request.execute(`${this.schema}.[usp_createUser]`)

    if (result.rowsAffected[0] > 0) {
      return true
    }
    return false
  }

  async checkSettings(settings: IAppUser): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('usercode', sql.Int, settings.usercode)
    request.input('user_type', sql.Int, settings.user_type)
    request.input('customer_id', sql.Int, settings.customer_id)
    request.input('address_id', sql.Int, settings.address_id)
    request.input('group_id', sql.Int, settings.group_id)
    request.input('promo', sql.Bit, settings.promo)
    request.input('bonus_percentage', sql.Numeric, settings.bonus_percentage)
    request.input('fostplus', sql.Bit, settings.fostplus)
    request.input('customer_type', sql.TinyInt, settings.customer_type)
    request.input('price_class', sql.Int, settings.price_class)

    const result = await request.execute(`${this.schema}.[usp_createOrUpdateSettings]`)

    if (result.rowsAffected[0] > 0) {
      return true
    }
    return false
  }

  async getCustomers(user_id: string): Promise<any[] | undefined> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('user_id', sql.Int, user_id)

    const result = await request.execute(`${this.schema}.[usp_getCustomers]`)
    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  /**
   * get audience and subject for jwt
   * @param user_id id of the user
   * @returns 
   */
  getAudSub = (user_id: number | string) => ({
    audience: [
      process.env.CLIENT_ID ?? 'unknown'
    ],
    subject: user_id.toString()
  })
}
