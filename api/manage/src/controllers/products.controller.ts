import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

declare module 'fastify' {
  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

import Product, { IBrabopakProductSpotlightpayload } from '../repositories/product.repository'

export default async function (fastify: FastifyInstance) {
  /**
   * @route GET /api/{APP_VERSION}/manage/products/spotlight
   */
  fastify.get('/spotlight', async function (request: FastifyRequest, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('read_all'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const repo = new Product(request.log)
      const result = await repo.get(request.jwt.sub)
      return reply.success(result, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get products')
      return reply.error('failed to get products')
    }
  })

  /**
   * @route POST /api/{APP_VERSION}/manage/products/spotlight
   */
  fastify.post('/spotlight', async function (request: FastifyRequest<{ Body: IBrabopakProductSpotlightpayload }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('write'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const repo = new Product(request.log)
      const success = await repo.post(request.jwt.sub, request.body)
      return reply.success(success, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to post product')
      return reply.error('failed to post product')
    }
  })

  /**
   * @route PUT /api/{APP_VERSION}/manage/products/spotlight/:product_id/:customer_type
   */
  fastify.put('/spotlight/:product_id/:customer_type', async function (request: FastifyRequest<{ Params: { product_id: number, customer_type: string | null }, Body: IBrabopakProductSpotlightpayload }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('write_all'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const repo = new Product(request.log)
      const success = await repo.put(request.jwt.sub, request.params.product_id, request.params.customer_type, request.body)
      return reply.success(success, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to put product')
      return reply.error('failed to put product')
    }
  })

  /**
   * @route DELETE /api/{APP_VERSION}/manage/products/spotlight/:product_id/:customer_type
   */
  fastify.delete('/spotlight/:product_id/:customer_type', async function (request: FastifyRequest<{ Params: { product_id: number, customer_type: string | null } }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('delete_all'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const repo = new Product(request.log)
      const success = await repo.delete(request.jwt.sub, request.params.product_id, request.params.customer_type)
      return reply.success({ success }, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to delete product')
      console.error(err)
      return reply.error('failed to delete product')
    }
  })
}