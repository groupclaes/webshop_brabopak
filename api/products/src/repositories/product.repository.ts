import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Product {
  schema: string = '[product].'

  async get(id: number, usercode: number, culture: string, user_id?: string): Promise<any | undefined> {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('id', sql.Int, id)
      r.input('user_id', sql.VarChar, user_id)
      r.input('usercode', sql.Int, usercode)
      r.input('culture', sql.VarChar, culture)
      const result = await r.execute(this.schema + '[usp_get]')

      if (result.recordset.length > 0) {
        return result.recordset[0]
      }
      return undefined
    } catch (err) {
      throw err
    }
  }

  async getBase(id: number, usercode: number, culture: string): Promise<any | undefined> {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('id', sql.Int, id)
      r.input('usercode', sql.Int, usercode)
      r.input('culture', sql.VarChar, culture)
      const result = await r.execute(this.schema + '[usp_getBase]')

      if (result.recordset.length > 0) {
        return result.recordset[0]
      }
      return undefined
    } catch (err) {
      throw err
    }
  }

  async findItemNumById(id: number): Promise<string | undefined> {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('id', sql.Int, id)
      const result = await r.execute('findItemNumById')

      if (result.recordset.length > 0) {
        return result.recordset[0].itemNum
      }
      return undefined
    } catch (err) {
      throw err
    }
  }

  async search(usercode: number, culture: string, query: string, only_favorites: boolean, only_promo: boolean, only_new: boolean, page: number, per_page: number, category: number | null, user_id?: string) {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('user_id', sql.Int, user_id)
      r.input('usercode', sql.Int, usercode)
      r.input('culture', sql.VarChar, culture)
      r.input('query', sql.VarChar, query)
      r.input('only_favorites', sql.Bit, only_favorites)
      r.input('only_promo', sql.Bit, only_promo)
      r.input('only_new', sql.Bit, only_new)
      r.input('page', sql.Int, page)
      r.input('per_page', sql.Int, per_page)
      r.input('category', sql.Int, category)
      const result = await r.execute(this.schema + 'usp_search')

      return {
        count: result.recordset[0]?.count,
        results: result.recordsets[1][0] ?? []
      }
    } catch (err) {
      throw err
    }
  }
}