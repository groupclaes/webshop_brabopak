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

  async put(user_id: string, id: number, user: IBrabopakUser) {
    const r = new sql.Request(await db.get(DB_NAME))
    r.input('user_id', sql.Int, user_id)
    r.input('id', sql.Int, id)

    r.input('username', sql.VarChar, user.username)
    r.input('usercode', sql.Int, user.usercode)
    r.input('given_name', sql.VarChar, user.given_name)
    r.input('family_name', sql.VarChar, user.family_name)
    r.input('phone_number', sql.VarChar, user.phone_number)
    r.input('phone_number_verified', sql.Bit, user.phone_number_verified)
    r.input('email_verified', sql.Bit, user.email_verified)
    r.input('marketing_notifications', sql.Bit, user.marketing_notifications)
    r.input('accepted_terms', sql.DateTime, user.accepted_terms)
    r.input('accepted_terms_version', sql.VarChar, user.accepted_terms_version)
    r.input('active', sql.Bit, user.active)

    this._fastify.log.debug({ sqlParam: { user_id, id }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: '[usp_putUser]' }, 'running procedure')
    const result = await r.execute(this.schema + '[usp_putUser]')
    this._fastify.log.debug({ result }, 'procedure result')

    return result.rowsAffected[0] > 0
  }
}

export interface IBrabopakUser {
  id: number
  username: string
  usercode: number

  customer_id: number // readonly
  address_id: number // readonly
  cart_available: boolean // readonly

  given_name: string
  family_name: string
  phone_number: string | null
  phone_number_verified: boolean
  email_verified: boolean

  last_authenticated_on: Date | null
  marketing_notifications: boolean
  accepted_terms: Date | null
  accepted_terms_version: number

  created: Date
  modified: Date | null
  active: boolean
}