import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import oe from '@groupclaes/oe-connector'

import Search, { ISearchFilters } from '../repositories/search.repository'

export default async function (fastify: FastifyInstance) {
  fastify.get('', async (request: FastifyRequest<{
    Querystring: {
      query: string
      culture?: string
      category_id?: number
    }
  }>, reply: FastifyReply) => {
    const start = performance.now()

    try {
      const repo = new Search()
      const query = request.query.query
      const culture = request.query.culture ?? 'nl'
      const category_id = request.query.category_id

      const data = await repo.getQueries({ user_id: request.jwt?.sub, query, culture, category_id })
      return reply.success(data, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get search queries')
      return reply.error('failed to get search queries')
    }
  })

  /**
   * @route POST /api/v1/search
   */
  fastify.post('', async (request: FastifyRequest<{
    Querystring: {
      usercode: number,
      culture?: string
    },
    Body: ISearchFilters
  }>, reply: FastifyReply) => {
    const start = performance.now()
    try {
      const repo = new Search()

      // Get a list of itemNums
      const response = await repo.search(request.query.usercode, request.query.culture, request.body ?? {}, request.jwt?.sub)
      const user: any | undefined = await repo.getUserInfo(request.jwt?.sub)

      if (request.query.usercode > 0) {
        try {
          await applyOpenedgeInformation(response.results)
        } catch (err) {
          request.log.error({ err }, 'error while retrieving product information from openedge')
        }
      }

      if (user === undefined || !user?.can_view_prices)
        removePriceDetails(response.results)

      return reply.success({
        productCount: response.count,
        products: response.results,
        breadcrumbs: response.breadcrumbs,
      }, 200, performance.now() - start)
    } catch (err) {
      return reply.error('failed to search in products')
    }
  })
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