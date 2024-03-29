import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import Dashboard from '../repositories/dashboard.repository'
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

export default async function (fastify: FastifyInstance) {
  fastify.get('', async (request: FastifyRequest<{
    Querystring: {
      usercode: number
      culture?: string
    }
  }>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const repo = new Dashboard()
      const culture = request.query.culture ?? 'nl'

      const user = await repo.getUserInfo(request.jwt.sub)

      const dashboard: any[] | undefined = await repo.get(request.query.usercode, request.jwt.sub, culture)

      if (!dashboard)
        return reply.success(undefined, 204)

      const blocks = dashboard.map(x => x[0])
      if (user === undefined || !user?.can_view_prices) {
        for (const list of blocks) {
          if (!list.products) continue
          removePriceDetails(list.products)
        }
      }

      // const data = dashboard.map(dashboard => dashboard[0])
      return reply.success({ blocks })
    } catch (err) {
      request.log.error({ error: err }, 'failed to get dashboard')
      return reply.error('failed to get dashboard')
    }
  })
}

function removePriceDetails(products: any[]) {
  for (const product of products) {
    if (!product.prices) continue
    for (const price of product.prices) {
      price.base = 0
      delete price.amount
      delete price.discount
      delete price.quantity
    }
  }
}