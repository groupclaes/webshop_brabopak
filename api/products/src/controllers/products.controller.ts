import oe from '@groupclaes/oe-connector'
import { success, fail, error } from '@groupclaes/fastify-elastic/responses'
import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

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
  const token: JWTPayload | undefined = request['token']

  try {
    const repo = new Product()

    const { id } = request.params
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    request.log.debug({ user_id: token?.sub, product_id: id, usercode, culture }, 'fetching product')

    const itemnum = await repo.findItemNumById(id)

    oe.configure({
      c: false,
      tw: 1000,
      simpleParameters: true
    })

    const promises = [
      repo.get(id, usercode, culture, token.sub),
      oe.run('getProdInfo', [
        'BRA',
        0,
        0,
        [{
          itemNum: itemnum
        }],
        undefined
      ])
    ]

    const responses = await Promise.all(promises)
    const response = {
      product: responses[0]
    }

    if (response.product === null)
      return fail(reply, { id: 'not found or no permission' }, 404)

    if (response.product.error)
      return error(reply, response.product.error)

    if (responses[1] && responses[1].status === 200 && response.product) {
      response.product.stock = responses[1].result.stock
      response.product.available_on = responses[1].result.availableOn
      response.product.in_backorder = responses[1].result.inBackorder
    }

    request.log.info({ product_id: id, usercode, culture }, 'Get product details')
    return success(reply, response)
  } catch (err) {

    request.log.error({ user_id: token?.sub, err }, 'failed to get product information')
    return error(reply, 'failed to get product information')
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
  const token: JWTPayload | undefined = request['token']

  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    request.log.debug({ user_id: token?.sub, product_id: id, usercode, culture }, 'fetching product base')

    const response = {
      product: await repo.getBase(id, usercode, culture)
    }

    if (response.product === null)
      return fail(reply, { id: 'not found or no permission' }, 404)

    if (response.product.error)
      return error(reply, response.product.error)

    return success(reply, response)
  } catch (err) {
    request.log.error({ user_id: token?.sub, err }, 'failed to get base product information')
    return error(reply, 'failed to get base product information')
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
  const token: JWTPayload = request['token']

  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode
    const mode = request.query.mode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

    if (product && customer) {
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

      if (oeResponse && oeResponse.status === 200) {
        await repo.putFavorite(id, customer.customer_id, customer.address_id, mode)
        return success(reply, oeResponse.result, oeResponse.status)
      }

      return fail(reply, oeResponse.result, oeResponse.status)
    }
  } catch (err) {
    request.log.error({ user_id: token.sub, err }, 'failed to update product favorite')
    return error(reply, 'failed to update product favorite status')
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
  // const token: JWTPayload = request['token']

  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

    if (product && customer) {
      const successfully = await repo.putDescription(id, customer.customer_id, customer.address_id, request.body.description)
      if (successfully)
        return success(reply, { success: successfully })

      request.log.warn('Failed to update database record')
      return fail(reply, { success: successfully, reason: 'Failed to update database record' })
    }

    request.log.error({ product_id: id, usercode }, 'product or customer not found')
    return error(reply, 'product or customer not found', 404)
  } catch (err) {
    request.log.error({ err }, 'failed to update product description')
    return error(reply, 'failed to update product description')
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
  // const token: JWTPayload = request['token']

  try {
    const repo = new Product()
    const id = request.params.id
    const usercode = +request.query.usercode

    const product = await repo.getBase(id, usercode, 'nl')
    const customer = await repo.getUserSettings(usercode)

    if (product && customer) {
      const successfully = await repo.deleteDescription(id, customer.customer_id, customer.address_id)
      if (successfully)
        return success(reply, { success: successfully })

      request.log.warn('Failed to remove database record')
      return fail(reply, { success: successfully, reason: 'Failed to remove database record' })
    }

    request.log.error({ product_id: id, usercode }, 'product or customer not found')
    return error(reply, 'product or customer not found', 404)
  } catch (err) {
    request.log.error({ err }, 'failed to remove product description')
    return error(reply, 'failed to remove product description')
  }
} 