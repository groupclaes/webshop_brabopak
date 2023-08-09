import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export class SSO {
  schema: string = '[sso]'

  /**
   * Get user information
   */
  async get(username: string): Promise<undefined | {
    id: number,
    username: string,
    password: string,
    usercode: number,
    active: boolean
  }> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('username', sql.VarChar, username)

    const result = await r.execute(`${this.schema}.[usp_getUser]`)

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  async getUserInfo(user_id: string): Promise<undefined | any> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)

    const result = await r.execute(`${this.schema}.[usp_getUserInfo]`)

    if (result.recordset.length > 0) {
      return result.recordset[0][0]
    }
    return undefined
  }

  /**
   *
   */
  async updatePassword(user_id: string, password: string): Promise<undefined | boolean> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('password', sql.VarChar, password)

    const result = await r.execute(`${this.schema}.[usp_updateUserPassword]`)

    if (result.recordset.length > 0) {
      return result.rowsAffected[0] > 0
    }
    return undefined
  }

  /**
   * Check if refresh token exists in DB
   */
  async refreshTokenExists(token: string): Promise<undefined | boolean> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)

    const result = await r.execute(`${this.schema}.[usp_getTokenExists]`)

    if (result.recordset.length > 0) {
      return result.recordset[0].exists
    }
    return undefined
  }

  /**
   * Create AuthorizationCode
   * @param {string} client_id
   * @param {number} user_id
   * @param {string} scope
   */
  async createAuthorizationCode(client_id: string, user_id: string, scope: string) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('client_id', sql.VarChar, client_id)
    r.input('user_id', sql.Int, user_id)
    r.input('scope', sql.VarChar, scope)

    const result = await r.execute(`${this.schema}.[usp_createAuthorizationCode]`)

    if (result.recordset.length > 0) {
      return result.recordset[0].code
    }
    return undefined
  }

  /**
   * Get information about the authorization code
   */
  async getAuthorizationCode(code: string): Promise<undefined | {
    user_id: string
    scope: string
    expires: Date
  }> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('code', sql.VarChar, code)

    const result = await r.execute(`${this.schema}.[usp_getAuthorizationCode]`)

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  /**
   * Get RefreshToken
   */
  async createRefreshToken(user_id: string, authorization_code: string, access_token: string): Promise<undefined | string> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('authorization_code', sql.VarChar, authorization_code)
    r.input('access_token', sql.VarChar, access_token)

    const result = await r.execute(`${this.schema}.[usp_createRefreshToken]`)

    if (result.recordset.length > 0) {
      return result.recordset[0].token
    }
    return undefined
  }

  /**
   * Get RefreshToken
   */
  async getRefreshToken(token: string): Promise<undefined | any> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)

    const result = await r.execute(`${this.schema}.[usp_getRefreshToken]`)

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  /**
   * Update RefreshToken
   */
  async updateRefreshToken(token: string): Promise<undefined | string> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)

    const result = await r.execute(`${this.schema}.[usp_updateRefreshToken]`)

    if (result.recordset) {
      return result.recordset[0].token
    }
    return undefined
  }

  /**
   * Revoke RefreshToken
   */
  async revokeRefreshToken(token: string, reason_revoked: string, replaced_by_token: string): Promise<undefined | string> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)
    r.input('reason_revoked', sql.VarChar, reason_revoked)
    r.input('replaced_by_token', sql.VarChar, replaced_by_token)

    const result = await r.execute(`${this.schema}.[usp_revokeRefreshToken]`)

    if (result.recordset.length > 0) {
      return result.recordset[0].token
    }
    return undefined
  }

  async getMfaInfo(mfa_code: string): Promise<undefined | any> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('mfa_code', sql.VarChar, mfa_code)

    const result = await r.execute(`${this.schema}[usp_getMfaInfo]`)

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  /**
   * @param {number} user_id -- ID of the user
   * @param {boolean} success -- true if successful
   * @param {number} result -- Result of the authentication attempt; 0 = failed, 1 = success, 2 = blocked, 3 = refused
   * @param {string} reason -- Reason the authentication attempt was rejected by the server
   * @param {string} ip -- IP address of the client
   * @param {number} rating -- rating of the authentication attempt
   * @param {string} user_agent -- Browser user agent this can be usefull to determine mallicious attempts
   * @returns {Promise<boolean>} True if successful
   */
  async addAuthLog(user_id?: string | null, success: boolean = false, result: number = 0, reason: null | string = null, ip: null | string = '127.0.0.1', rating: number = 50, user_agent: null | string = null): Promise<undefined | boolean> {
    const r = new sql.Request(await db.get(DB_NAME))
    if (user_id === undefined) user_id = null
    r.input('user_id', sql.Int, user_id)
    r.input('client_id', sql.VarChar, 'hBK4c2uZK5')
    r.input('success', sql.Bit, success)
    r.input('result', sql.TinyInt, result)
    r.input('reason', sql.VarChar, reason)
    r.input('ip', sql.VarChar, ip)
    r.input('rating', sql.TinyInt, rating)
    r.input('user_agent', sql.VarChar, user_agent)

    const res = await r.execute(`${this.schema}.[usp_addAuthLog]`)

    if (res.rowsAffected.length > 0) {
      return res.rowsAffected[0] > 0
    }
    return undefined
  }

  /**
   *
   */
  async getFailedAuthAttempts(user_id: string | null = null, ip: string | null = null): Promise<{ user: any[], ip: any[] }> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('ip', sql.VarChar, ip)

    const res = await r.execute(`${this.schema}.[usp_getFailedAuthAttempts]`)

    if (res.recordsets.length > 0) {
      return {
        user: res.recordsets[0] ?? [],
        ip: res.recordsets[1] ?? []
      }
    }
    return {
      user: [],
      ip: []
    }
  }

  async createResetToken(user_id: string, ip: string = '127.0.0.1'): Promise<string | undefined> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('ip', sql.VarChar, ip)

    const res = await r.execute(`${this.schema}.[usp_createResetToken]`)
    return res.recordset[0]?.token
  }

  async revokeResetToken(token: string, ip: string = '127.0.0.1', reason?: string): Promise<boolean> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)
    r.input('ip', sql.VarChar, ip)
    r.input('reason', sql.VarChar, reason)

    const res = await r.execute(`${this.schema}.[usp_revokeResetToken]`)
    return res.rowsAffected.length > 0 && res.rowsAffected[0] > 0
  }

  async getResetToken(token: string): Promise<string | undefined> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('token', sql.VarChar, token)

    const res = await r.execute(`${this.schema}.[usp_getResetToken]`)
    return res.recordset[0]?.user_id
  }
}