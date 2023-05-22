// External Dependancies
import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
// import oe from '@groupclaes/oe-connector'

import Product from '../repositories/product.repository'

/**
 * @route GET /api/v1/products/:id
 */
export const get = async (request: FastifyRequest<{
  Params: {
    id: number
  }, Querystring: {
    usercode: number
    culture?: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Product()
    const token: JWTPayload = request['token'] || { sub: null }

    const { id } = request.params
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'
    let resp

    // const itemnum = await repo.findItemNumById(id)

    // oe.configure({
    //   c: false
    // })

    // let oeResponse = await oe.run('getProdInfo', [
    //   'GRO',
    //   0,
    //   0,
    //   [{
    //     itemNum: itemnum
    //   }],
    //   undefined
    // ], {
    //   tw: 1000,
    //   simpleParameters: true
    // })

    // if (oeResponse && oeResponse.status === 200) {
    //   resp = oeResponse.result
    //   console.log(resp)
    // }

    const response = {
      product: await repo.get(id, usercode, culture, token.sub)
    }

    if (response.product === null) {
      reply
        .status(401)
        .send({
          verified: false,
          error: 'Wrong credentials'
        })
      return
    }

    if (response.product.error) {
      reply
        .status(404)
        .send({
          error: response.product.error
        })
      return
    }

    if (resp && response.product) {
      response.product.stock = resp !== undefined ? resp.stock : -1
      response.product.availableOn = resp !== undefined ? resp.availableOn : null
      response.product.inBackorder = resp !== undefined ? resp.inBackorder : false
    }

    const stock = resp !== undefined ? resp.stock : -1

    request.log.info({ productId: id, usercode, stock, culture }, 'Get product details')

    return response
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * @route GET /api/v1/products/:id/base
 */
export const getBase = async (request: FastifyRequest<{
  Params: {
    id: number
  },
  Querystring: {
    usercode: number
    culture?: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    const response = {
      product: await repo.getBase(id, usercode, culture)
    }

    if (response.product === null) {
      reply
        .status(401)
        .send({
          verified: false,
          error: 'Wrong credentials'
        })
      return
    }

    return response
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * @route POST /api/v1/products/search
 */
export const postSearch = async (request: FastifyRequest<{
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
    const repo = new Product()
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

    if (userCode !== 0) {
      //   // get oeInfo
      //   let resp
      //   let oeResponse = await oe.run('eCommerce/v1/getProdInfo', [
      //     'GRO',
      //     0,
      //     0,
      //     response.results.map(e => ({
      //       id: e.id,
      //       itemNum: e.itemNum
      //     })),
      //     undefined
      //   ], {
      //     tw: 1000
      //   })

      // if (oeResponse && oeResponse.status === 200) {
      //   resp = oeResponse.result.id !== undefined ? [oeResponse.result] : oeResponse.result

      //   products.forEach(product => {
      //     // find oe resp
      //     const oeRes = resp.find(e => e.itemNum === product.itemNum)

      //     product.stock = oeRes !== undefined ? oeRes.stock : -1
      //     product.availableOn = oeRes !== undefined ? oeRes.availableOn : null
      //     product.inBackorder = oeRes !== undefined ? oeRes.inBackorder : false
      //   })
      // }
    } else {
      // remove prices from response user is not authenticated
      products.forEach(product => {
        product.prices = null
      })
    }
    return {
      productCount: response.count,
      products,
      executionTime: performance.now() - start
    }
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}