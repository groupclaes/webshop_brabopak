import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

import Dashboard from '../repositories/dashboard.repository'

// get dashboard
export const get = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
    culture?: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Dashboard()
    const token: JWTPayload = request['token'] || { sub: null }
    const culture = request.query.culture ?? 'nl'

    return await repo.get(request.query.usercode, token.sub, culture)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}