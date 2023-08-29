import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import oe from '@groupclaes/oe-connector'

import Cart from '../repositories/carts.repository'

export default async function (fastify: FastifyInstance) {
  fastify.get('/:id', async (request: FastifyRequest<{
    Querystring: {
      usercode: number
    }, Params: {
      id: number
    }
  }>, reply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const repo = new Cart()

      if (request.jwt.sub) {
        const user = await repo.getUserInfo(request.jwt.sub)
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
          return reply.success(oeResponse.result)

        return reply.fail(oeResponse.result, oeResponse.status)
      }
    } catch (err) {
      request.log.fatal(request.body, 'failed to get order!')
      return reply.error('failed to get order')
    }
  })

  // get order history (from RAW)
  fastify.get('', async (request: FastifyRequest<{
    Querystring: {
      usercode: number
    }
  }>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)
      const repo = new Cart()

      if (request.jwt.sub) {
        const user = await repo.getUserInfo(request.jwt.sub)
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
          return reply.success(oeResponse.result)

        return reply.fail(oeResponse.result, oeResponse.status)
      }
    } catch (err) {
      request.log.fatal(request.body, 'failed to get history!')
      return reply.error('failed to get order history')
    }
  })
}