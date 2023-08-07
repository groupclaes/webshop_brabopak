import { FastifyRequest, FastifyReply } from 'fastify'
import { success, error } from '@groupclaes/fastify-elastic/responses'
import { JWTPayload } from 'jose'

import Categories from '../repositories/categories.repository'

export const get = async (request: FastifyRequest<{
  Querystring: {
    culture?: string
  }
}>, reply: FastifyReply) => {
  const token: JWTPayload = request['token']
  
  try {
    const repo = new Categories()
    const culture = request.query.culture ?? 'nl'

    const data = await repo.getTree(token.sub, culture)
    return success(reply, data)
  } catch (err) {
    return error(reply, 'failed to get categories tree from database')
  }
}