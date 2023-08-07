import { FastifyRequest, FastifyReply } from 'fastify'
import { success, fail, error } from '@groupclaes/fastify-elastic/responses'
import { JWTPayload } from 'jose'

import oe from '@groupclaes/oe-connector'

import Cart from '../repositories/carts.repository'

export const get = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
  }, Params: {
    id: number
  }
}>, reply) => {
  const token: JWTPayload = request['token']

  try {
    const repo = new Cart()

    if (token.sub) {
      const user = await repo.getUserInfo(token.sub)
      const customer = await repo.getUserSettings(request.query.usercode)

      oe.configure({
        c: false,
        tw: -1,
        simpleParameters: true
      })

      let oeResponse = await oe.run('getOrder', [
        'BRA',
        'user',
        customer.customer_id,
        customer.address_id,
        +request.params.id,
        undefined
      ])

      request.log.info({ order_id: request.params.id, customer_id: customer.customer_id, address_id: customer.address_id, user, customer }, 'Get order')

      if (oeResponse && oeResponse.status === 200)
        return success(reply, oeResponse.result)

      return fail(reply, oeResponse.result, oeResponse.status)
    }
  } catch (err) {
    request.log.fatal(request.body, 'failed to get order!')
    return error(reply, 'failed to get order')
  }
}

// get order history (from RAW)
export const getHistory = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
  }
}>, reply: FastifyReply) => {
  const token: JWTPayload = request['token']

  try {
    const repo = new Cart()

    if (token.sub) {
      const user = await repo.getUserInfo(token.sub)
      const customer = await repo.getUserSettings(request.query.usercode)

      oe.configure({
        c: false,
        tw: -1,
        simpleParameters: true
      })

      // get orderhis from raw
      let oeResponse = await oe.run('getOrderHis', [
        'BRA',
        'user',
        customer.customer_id,
        customer.address_id,
        25,
        undefined
      ])

      request.log.info({ customer_id: customer.customer_id, address_id: customer.address_id, user, customer }, 'Get orders history')

      if (oeResponse && oeResponse.status === 200)
        return success(reply, oeResponse.result)

      return fail(reply, oeResponse.result, oeResponse.status)
    }
  } catch (err) {
    request.log.fatal(request.body, 'failed to get history!')
    return error(reply, 'failed to get order history')
  }
}