import sql from 'mssql'
import db from '../db'
import { FastifyBaseLogger } from 'fastify'

const DB_NAME = 'brabopak'

export default class Product {
  schema: string = '[manage].'
  _logger: FastifyBaseLogger

  constructor(logger: FastifyBaseLogger) { this._logger = logger }

  async get(user_id: string) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    this._logger.debug({ sqlParam: { user_id }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_getProductsSpotlight]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_getProductsSpotlight]')
    this._logger.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? {
      products: result.recordsets[0][0],
      customer_types: result.recordsets[1],
      units: result.recordsets[2]
    } : undefined
  }

  async post(user_id: string, payload: IBrabopakProductSpotlightpayload) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('payload_product_itemnum', sql.VarChar, payload.product_itemnum)
    if (payload.customer_type && payload.customer_type != null)
      r.input('payload_customer_type', sql.Int, payload.customer_type)
    r.input('payload_unit_id', sql.Int, payload.unit_id)
    this._logger.debug({ sqlParam: { user_id, payload }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_postProductsSpotlight]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_postProductsSpotlight]')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? { success: result.rowsAffected[0] > 0, product: result.recordsets[0][0] } : false
  }

  async put(user_id: string, product_id: number, customer_type: string | null, payload: IBrabopakProductSpotlightpayload) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('product_id', sql.Int, product_id)
    if (customer_type && customer_type != null)
      r.input('customer_type', sql.Int, customer_type)
    r.input('payload_product_itemnum', sql.VarChar, payload.product_itemnum)
    if (payload.customer_type && payload.customer_type != null)
      r.input('payload_customer_type', sql.Int, payload.customer_type)
    r.input('payload_unit_id', sql.Int, payload.unit_id)
    this._logger.debug({ sqlParam: { user_id, product_id, customer_type, payload }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_putProductsSpotlight]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_putProductsSpotlight]')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? { success: result.rowsAffected[0] > 0, product: result.recordsets[0][0] } : false
  }

  async delete(user_id: string, product_id: number, customer_type: string | null) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('product_id', sql.Int, product_id)
    if (customer_type && customer_type != null)
      r.input('customer_type', sql.Int, customer_type)
    this._logger.debug({ sqlParam: { user_id, product_id, customer_type }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_deleteProductsSpotlight]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_deleteProductsSpotlight]')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? result.rowsAffected[0] > 0 : false
  }
}

export interface IBrabopakProductSpotlightpayload {
  product_itemnum: string
  customer_type: number | null
  unit_id: number
}