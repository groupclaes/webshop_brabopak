import { FastifyRequest, FastifyReply } from 'fastify'
import { success, error } from '@groupclaes/fastify-elastic/responses'
import { JWTPayload } from 'jose'

import Dashboard from '../repositories/dashboard.repository'

// get dashboard
export const get = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
    culture?: string
  },
  token: JWTPayload
}>, reply: FastifyReply) => {
  try {
    const repo = new Dashboard()
    const token: JWTPayload = request['token']
    const culture = request.query.culture ?? 'nl'

    if (!token.sub)
      return

    const user = await repo.getUserInfo(token.sub)
    let canViewPrices = false
    if (user)
      canViewPrices = user.user_type === 2 || user.user_type === 3

    const dashboard: any[] | undefined = await repo.get(request.query.usercode, token.sub, culture)

    if (!dashboard)
      return success(reply, undefined, 204)

    const blocks = dashboard.map(x => x[0])
    if (!canViewPrices) {
      for (const list of blocks) {
        if (!list.products) continue
        for (const product of list.products) {
          product.prices?.forEach(price => {
            price.base = 0
            delete price.amount
            delete price.discount
            delete price.quantity
          })
        }
      }
    }

    // const data = dashboard.map(dashboard => dashboard[0])

    return success(reply, { blocks })
  } catch (err) {
    request.log.error({ error: err }, 'failed to get dashboard')
    return error(reply, 'failed to get dashboard')
  }
}