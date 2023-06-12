import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Search {
  schema: string = '[ecommerce].'

  async getQueries(args: { user_id?: string, query: string, culture: string, category_id?: number }) {
    try {
      const r = new sql.Request(await db.get(DB_NAME))
      r.input('user_id', sql.Int, args.user_id)
      r.input('query', sql.VarChar, args.query)
      r.input('culture', sql.Char, args.culture)
      r.input('category_id', sql.Int, args.category_id)
      const result = await r.execute(this.schema + '[usp_getSearch]')


      const results = result.recordsets[0].map(r => r.query)
      const popular = result.recordsets[1].map(r => r.query)

      return {
        results,
        popular
      }
    } catch (err) {
      throw err
    }
  }
}
