import sql from 'mssql'
import db from '../db'
import { FastifyInstance } from 'fastify'

const DB_NAME = 'brabopak'

export default class Search {
  schema: string = '[manage].'
  _fastify: FastifyInstance

  constructor(fastify: FastifyInstance) { this._fastify = fastify }

  async get(user_id: string, id?: number) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    if (id)
      r.input('id', sql.Int, id)
    this._fastify.log.debug({ sqlParam: { user_id, id }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_getUsers]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_getUsers]')
    this._fastify.log.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? result.recordsets[0] : undefined
  }
}