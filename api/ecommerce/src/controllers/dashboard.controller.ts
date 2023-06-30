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

    if (!token.sub)
      return reply
        .status(401)
        .send({ error: 'Unauthorized!' })

    const user = await repo.getUserInfo(token.sub)

    const canViewPrices = user.uer_type === 2 || user.uer_type === 3

    const dashboard: any[] | undefined = await repo.get(request.query.usercode, token.sub, culture)

    if (!dashboard)
      return reply
        .status(204)
        .send()

    for (const productLists of dashboard) {
      for (const product of productLists.products) {
        if (!canViewPrices) {
          product.prices?.forEach(price => {
            price.base = 0
            delete price.amount
            delete price.discount
            delete price.quantity
          })
        }
      }
    }

    return dashboard.map(list => list[0])
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}