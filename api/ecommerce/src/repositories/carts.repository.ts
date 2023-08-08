import sql from 'mssql'
import db from '../db'

const DB_NAME = 'brabopak'

export default class Cart {
  schema: string = '[ecommerce].'

  async get(usercode: number, user_id?: string, culture: string = 'nl') {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('usercode', sql.Int, usercode)
    r.input('culture', sql.VarChar, culture)
    const result = await r.execute(this.schema + '[usp_getCart]')

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  async updateProduct(usercode: number, user_id: string, product_id: number, amount: number) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('usercode', sql.Int, usercode)
    r.input('product_id', sql.Int, product_id)
    r.input('amount', sql.SmallInt, amount)
    const result = await r.execute(this.schema + '[usp_updateCartProduct]')

    return result.rowsAffected[0] > 0
  }

  async getProductInfo(product_id: number) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('product_id', sql.Int, product_id)
    const result = await r.execute(this.schema + '[usp_getCartProductInfo]')

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  async getProductInfos(products: any[]) {
    const res: any[] = []

    for (const p of products) {
      const info = await this.getProductInfo(p.id)
      res.push({
        itemnum: info.itemnum,
        quantity: p.quantity,
        unit: info.unit
      })
    }

    return res
  }

  async getUserInfo(user_id: string): Promise<undefined | any> {
    if (!user_id) return undefined

    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)

    const result = await r.execute(`sso.usp_getUserInfo`)

    if (result.recordset.length > 0) {
      return result.recordset[0][0]
    }
    return undefined
  }

  async getUserSettings(usercode: number): Promise<undefined | any> {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('usercode', sql.Int, usercode)

    const result = await r.execute(`sso.usp_getUserSettings`)

    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }
}