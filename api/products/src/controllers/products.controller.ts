// External Dependancies
import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
import oe from '@groupclaes/oe-connector'

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

    const itemnum = await repo.findItemNumById(id)

    oe.configure({
      c: false,
      tw: 1000,
      simpleParameters: true
    })

    let oeResponse = await oe.run('getProdInfo', [
      'BRA',
      0,
      0,
      [{
        itemNum: itemnum
      }],
      undefined
    ])

    if (oeResponse && oeResponse.status === 200) {
      resp = oeResponse.result
    }

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

export const putFavorite = async (request: FastifyRequest<{
  Params: {
    id: number
  },
  Querystring: {
    usercode: number,
    mode: number
  }
}>, reply: FastifyReply) => {
  try {

    const repo = new Product()
    const id = request.params.id
    const usercode = request.query.usercode
    const mode = request.query.mode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(+request.query.usercode)

    if (product && customer) {
      console.debug(customer)
      oe.configure({
        c: false,
        tw: -1,
        simpleParameters: true
      })

      let oeResponse = await oe.run('putFavorite', [
        'BRA',
        {
          favorites: [{
            usercode,
            customer_id: customer.customer_id,
            address_id: customer.address_id,
            itemnum: product.itemnum,
            unit_code: product.unit_code,
            mode
          }]
        },
        undefined
      ])

      request.log.info({ order_id: request.params.id, customer_id: customer.customer_id, address_id: customer.address_id, customer }, 'Put favorite')
      console.debug(oeResponse)

      if (oeResponse && oeResponse.status === 200) {
        await repo.putFavorite(id, customer.customer_id, customer.address_id, mode)
        return { statusCode: 200, result: oeResponse.result }
      }

      return reply
        .code(oeResponse.status)
        .send(oeResponse)
    }
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}