import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import Categories from '../repositories/categories.repository'
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
      culture?: string
    }
  }>, reply: FastifyReply) => {
    try {
      const repo = new Categories()
      const culture = request.query.culture ?? 'nl'

      const data = await repo.getTree(request.jwt?.sub, culture)
      return reply.success(data)
    } catch (err) {
      return reply.error('failed to get categories tree from database')
    }
  })
}