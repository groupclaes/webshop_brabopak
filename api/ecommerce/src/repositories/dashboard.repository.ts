import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Cart {
  schema: string = '[ecommerce].'

  async get(usercode: number, user_id?: string, culture: string = 'nl') {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('user_id', sql.Int, user_id)
      r.input('usercode', sql.Int, usercode)
      r.input('culture', sql.VarChar, culture)
      const result = await r.execute(this.schema + '[usp_getDashboard]')

      if (result.recordset.length > 0) {
        return result.recordsets as any[]
      }
      return undefined
    } catch (err) {
      throw err
    }
  }

  /**
   * SSO Get user details by ID
   * @param user_id 
   * @returns 
   */
  async getUserInfo(user_id: string): Promise<undefined | any> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)

    const result = await r.execute(`sso.usp_getUserInfo`)

    if (result.recordset.length > 0) {
      return result.recordset[0][0]
    }
    return undefined
  }
}