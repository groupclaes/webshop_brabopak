import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Categories {
  schema: string = '[ecommerce].'

  async getTree(user_id?: string, culture: string = 'nl') {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('culture', sql.VarChar, culture)
    const result = await r.execute(this.schema + '[usp_getCategoriesTree]')

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }
}