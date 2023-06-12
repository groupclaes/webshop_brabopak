import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

import Search from '../repositories/search.repository'

export const get = async (request: FastifyRequest<{
  Querystring: {
    query: string
    culture?: string
    category_id?: number
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Search()
    const token: JWTPayload = request['token'] || { sub: null }
    const query = request.query.query
    const culture = request.query.culture ?? 'nl'
    const category_id = request.query.category_id

    return await repo.getQueries({ user_id: token.sub, query, culture, category_id })
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}