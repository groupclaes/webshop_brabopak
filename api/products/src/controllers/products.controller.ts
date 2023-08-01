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
      return reply
        .status(401)
        .send({
          status: 'fail',
          code: 401,
          message: 'Unauthorized'
        })
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
      response.product.available_on = resp !== undefined ? resp.availableOn : null
      response.product.in_backorder = resp !== undefined ? resp.inBackorder : false
    }

    const stock = resp !== undefined ? resp.stock : -1

    request.log.info({ productId: id, usercode, stock, culture }, 'Get product details')
    return {
      status: 'success',
      code: 200,
      data: response
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to get product information'
      })
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
      return reply
        .status(401)
        .send({
          status: 'fail',
          code: 401,
          message: 'Unauthorized'
        })
    }
    return {
      status: 'success',
      code: 200,
      data: response
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to get base product information'
      })
  }
}

export const putFavorite = async (request: FastifyRequest<{
  Params: {
    id: number
  },
  Querystring: {
    usercode: string,
    mode: number
  }
}>, reply: FastifyReply) => {
  try {

    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode
    const mode = request.query.mode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

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
        return {
          status: 'success',
          code: oeResponse.status,
          data: oeResponse.result
        }
      }

      return {
        status: 'fail',
        code: oeResponse.status,
        data: oeResponse.result
      }
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to update product favorite status'
      })
  }
}

export const putDescription = async (request: FastifyRequest<{
  Params: {
    id: number
  },
  Querystring: {
    usercode: string
  },
  Body: {
    description: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

    if (product && customer) {
      const success = await repo.putDescription(id, customer.customer_id, customer.address_id, request.body.description)
      if (success) {
        return {
          status: 'success',
          code: 200,
          data: {
            success
          }
        }
      }

      return {
        status: 'fail',
        code: 404,
        message: 'Failed to update database record',
        data: {
          success
        }
      }
    }

    return {
      status: 'error',
      code: 404,
      message: 'product or customer not found'
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to update product description'
      })
  }
}

export const deleteDescription = async (request: FastifyRequest<{
  Params: {
    id: number
  },
  Querystring: {
    usercode: string
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

    if (product && customer) {
      const success = await repo.deleteDescription(id, customer.customer_id, customer.address_id)
      if (success) {
        return {
          status: 'success',
          code: 200,
          data: {
            success
          }
        }
      }

      return {
        status: 'fail',
        code: 404,
        message: 'Failed to remove database record',
        data: {
          success
        }
      }
    }

    return {
      status: 'error',
      code: 404,
      message: 'product or customer not found'
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to remove product description'
      })
  }
} 