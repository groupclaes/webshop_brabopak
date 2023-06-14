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