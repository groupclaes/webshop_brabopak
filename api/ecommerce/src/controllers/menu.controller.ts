import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

import Categories from '../repositories/categories.repository'

export const get = async (request: FastifyRequest<{
  Querystring: {
    culture?: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Categories()
    const token: JWTPayload = request['token'] || { sub: null }
    const culture = request.query.culture ?? 'nl'

    const data = await repo.getTree(token.sub, culture)
    return {
      status: 'success',
      code: 200,
      data
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to get categories tree from database'
      })
  }
}