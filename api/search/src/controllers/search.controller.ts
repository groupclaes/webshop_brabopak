import { FastifyRequest, FastifyReply } from 'fastify'
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
  try {
    const repo = new Search()
    const token: JWTPayload = request['token'] || { sub: null }

    const userCode = request.query.usercode
    const filter = request.body ?? {}

    const culture = request.query.culture ?? filter.culture ?? 'nl'
    const query = filter.query ?? ''
    const oFavorites = filter.only_favorites ?? false
    const oPromo = filter.only_promo ?? false
    const oNew = filter.only_new ?? false
    const page = filter.page ?? 0
    const perPage = filter.per_page ?? 48
    const category = filter.category_id ?? null

    // Get a list of itemNums
    const response = await repo.search(userCode, culture, query, oFavorites, oPromo, oNew, page, perPage, category, token.sub)
    const products = response.results
    console.log(response)

    if (userCode !== 0) {
      // get oeInfo
      let resp

      oe.configure({
        c: false,
        tw: 1000,
        simpleParameters: true
      })

      let oeResponse = await oe.run('getProdInfo', [
        'BRA',
        0,
        0,
        response.results.map(e => ({
          id: e.id,
          itemNum: e.itemNum
        })),
        undefined
      ])

      if (oeResponse && oeResponse.status === 200) {
        resp = oeResponse.result.id !== undefined ? [oeResponse.result] : oeResponse.result

        products.forEach(product => {
          // find oe resp
          const oeRes = resp.find(e => e.itemNum === product.itemNum)

          product.stock = oeRes !== undefined ? oeRes.stock : -1
          product.availableOn = oeRes !== undefined ? oeRes.availableOn : null
          product.inBackorder = oeRes !== undefined ? oeRes.inBackorder : false
        })
      }
    } else {
      // remove prices from response user is not authenticated
      products.forEach(product => {
        product.prices = null
      })
    }
    return {
      productCount: response.count,
      products,
      breadcrumbs: response.breadcrumbs,
      executionTime: performance.now() - start
    }
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}