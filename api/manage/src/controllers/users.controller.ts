import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import User from '../repositories/user.repository'

export default async function (fastify: FastifyInstance) {
  /**
   * @route GET /api/{APP_VERSION}/manage/users/:id?
   */
  fastify.get('', { preHandler: (req, rep) => authHandle(req, rep, 'read', 'GroupClaes.EMP/brabopak/users') }, handler)
  fastify.get('/:id', { preHandler: (req, rep) => authHandle(req, rep, 'read', 'GroupClaes.EMP/brabopak/users') }, handler)

  async function authHandle(request: FastifyRequest, reply: FastifyReply, perm: string, path?: string) {

  }

  async function handler(request: FastifyRequest<{ Params: { id?: number } }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    try {
      const repo = new User(fastify)
      const users = await repo.get(request.jwt.sub, request.params.id)
      return reply.success({ users }, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err, id: request.params.id }, 'failed to get users')
      return reply.error('failed to get users')
    }
  }
}
