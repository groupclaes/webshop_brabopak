import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Search {
  schema: string = '[search].'

  async getQueries(args: { user_id?: string, query: string, culture: string, category_id?: number }) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, args.user_id)
    r.input('query', sql.VarChar, args.query)
    r.input('culture', sql.Char, args.culture)
    r.input('category_id', sql.Int, args.category_id)
    const result = await r.execute(this.schema + '[usp_get]')


    const results = result.recordsets[0].map(r => r.query)
    const popular = result.recordsets[1].map(r => r.query)

    return {
      results,
      popular
    }
  }

  async search(usercode: number, culture: string | undefined, filter: ISearchFilters, user_id?: string) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('usercode', sql.Int, usercode)
    r.input('culture', sql.VarChar, culture ?? filter.culture)
    r.input('query', sql.VarChar, filter.query)
    r.input('only_favorites', sql.Bit, filter.only_favorites)
    r.input('only_promo', sql.Bit, filter.only_promo)
    r.input('only_new', sql.Bit, filter.only_new)
    r.input('page', sql.Int, filter.page)
    r.input('per_page', sql.Int, filter.per_page)
    r.input('category', sql.Int, filter.category_id)
    const result = await r.execute(this.schema + 'usp_post')

    return {
      count: result.recordset[0]?.count,
      results: result.recordsets[1][0] ?? [],
      breadcrumbs: result.recordsets[2] ?? [],
    }
  }

  async getUserInfo(user_id?: string): Promise<undefined | any> {
    if (!user_id) return undefined

    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)

    const result = await r.execute(`sso.usp_getUserInfo`)

    if (result.recordset.length > 0) {
      return result.recordset[0][0]
    }
    return undefined
  }
}

export interface ISearchFilters {
  culture?: string
  query?: string
  only_favorites?: boolean
  only_promo?: boolean
  only_new?: boolean
  page?: number
  per_page?: number
  category_id?: number
}