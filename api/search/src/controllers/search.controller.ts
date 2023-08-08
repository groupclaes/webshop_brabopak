import { FastifyRequest, FastifyReply } from 'fastify'
import { success, error } from '@groupclaes/fastify-elastic/responses'
import { JWTPayload } from 'jose'
import oe from '@groupclaes/oe-connector'

import Search from '../repositories/search.repository'

export const get = async (request: FastifyRequest<{
  Querystring: {
    query: string
    culture?: string
    category_id?: number
  }
}>, reply: FastifyReply) => {
  const start = performance.now()
  const token: JWTPayload = request['token']

  try {
    const repo = new Search()
    const query = request.query.query
    const culture = request.query.culture ?? 'nl'
    const category_id = request.query.category_id

    const data = await repo.getQueries({ user_id: token.sub, query, culture, category_id })
    return success(reply, data, 200, performance.now() - start)
  } catch (err) {
    request.log.error({ err }, 'failed to get search queries')
    return error(reply, 'failed to get search queries')
  }
}

/**
 * @route POST /api/v1/search
 */
export const post = async (request: FastifyRequest<{
  Querystring: {
    usercode: number,
    culture?: string
  },
  Body: {
    culture?: string
    query?: string
    only_favorites?: boolean
    only_promo?: boolean
    only_new?: boolean
    page?: number
    per_page?: number
    category_id?: number
  }
}>, reply: FastifyReply) => {
  const start = performance.now()
  const token: JWTPayload = request['token']

  try {
    const repo = new Search()

    const userCode = request.query.usercode
    const filter = request.body ?? {}
    const culture = request.query.culture ?? filter.culture ?? 'nl'

    // Get a list of itemNums
    const response = await repo.search(userCode, culture, filter, token.sub)

    const user: any | undefined = await repo.getUserInfo(token.sub)

    if (userCode > 0) {
      try {
        await applyOpenedgeInformation(response.results)
      } catch (err) {
        request.log.error({ err }, 'error while retrieving product information from openedge')
      }
    }

    if (user === undefined || !user?.can_view_prices)
      removePriceDetails(response.results)

    return success(reply, {
      productCount: response.count,
      products: response.results,
      breadcrumbs: response.breadcrumbs,
    }, 200, performance.now() - start)
  } catch (err) {
    return error(reply, 'failed to search in products')
  }
}

async function applyOpenedgeInformation(products: any[]) {
  let resp: any

  oe.configure({
    c: false,
    tw: 1000,
    simpleParameters: true
  })

  let oeResponse: any | undefined = await oe.run('getProdInfo', [
    'BRA',
    0,
    0,
    products.map(e => ({
      id: e.id,
      itemNum: e.itemNum
    })),
    undefined
  ])

  if (oeResponse?.status === 200) {
    resp = oeResponse.result.id !== undefined ? [oeResponse.result] : oeResponse.result

    products.forEach(product => {
      // find oe resp
      const oeRes = resp.find(e => e.itemNum === product.itemNum)

      product.stock = oeRes !== undefined ? oeRes.stock : -1
      product.available_on = oeRes !== undefined ? oeRes.availableOn : null
      product.in_backorder = oeRes !== undefined ? oeRes.inBackorder : false
    })
  }
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