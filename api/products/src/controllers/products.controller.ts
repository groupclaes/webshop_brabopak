import oe from '@groupclaes/oe-connector'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import Product from '../repositories/product.repository'

export default async function (fastify: FastifyInstance) {
  /**
   * @route GET /api/v1/products/:id
   */
  fastify.get('/:id', async (request: FastifyRequest<{
    Params: {
      id: number
    }, Querystring: {
      usercode: number
      culture?: string
    }
  }>, reply: FastifyReply) => {
    try {
      const repo = new Product()

      const { id } = request.params
      const usercode = request.query.usercode
      const culture = request.query.culture ?? 'nl'

      request.log.debug({ user_id: request.jwt?.sub, product_id: id, usercode, culture }, 'fetching product')

      const itemnum = await repo.findItemNumById(id)

      oe.configure({
        c: false,
        tw: 1000,
        simpleParameters: true
      })

      const promises = [
        repo.get(id, usercode, culture, request.jwt?.sub),
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

      const responses = await Promise.all(promises).catch(err => {
        request.log.error({ err }, 'error in promise.all')
      })
      const response = {
        product: responses[0]
      }

      if (response.product === null)
        return reply.fail({ id: 'not found or no permission' }, 404)

      if (response.product.error)
        return reply.error(response.product.error)

      const user = await repo.getUserInfo(request.jwt.sub)
      if (user === undefined || !user?.can_view_prices) {
        for (const price of response.product.prices) {
          price.base = 0
          delete price.amount
          delete price.discount
          delete price.quantity
        }
      }

      if (responses[1] && responses[1].status === 200 && response.product) {
        response.product.stock = responses[1].result.stock
        response.product.available_on = responses[1].result.availableOn
        response.product.in_backorder = responses[1].result.inBackorder
      }

      request.log.info({ product_id: id, usercode, culture }, 'Get product details')
      return reply.success(response)
    } catch (err) {
      request.log.error({ err }, 'failed to get product information')
      return reply.error('failed to get product information')
    }
  })

  /**
   * @route GET /api/v1/products/:id/base
   */
  fastify.get('/:id/base', async (request: FastifyRequest<{
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

      request.log.debug({ user_id: request.jwt?.sub, product_id: id, usercode, culture }, 'fetching product base')

      const response = {
        product: await repo.getBase(id, usercode, culture)
      }

      if (response.product === null)
        return reply.fail({ id: 'not found or no permission' }, 404)

      if (response.product.error)
        return reply.error(response.product.error)

      return reply.success(response)
    } catch (err) {
      request.log.error({ user_id: request.jwt?.sub, err }, 'failed to get base product information')
      return reply.error('failed to get base product information')
    }
  })

  /**
   * @route PUT /api/v1/products/:id/favorite
   */
  fastify.put('/:id/favorite', async (request: FastifyRequest<{
    Params: {
      id: number
    },
    Querystring: {
      usercode: string,
      mode: number
    }
  }>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

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
          return reply.success(oeResponse.result, oeResponse.status)
        }

        return reply.fail(oeResponse.result, oeResponse.status)
      }
    } catch (err) {
      request.log.error({ err }, 'failed to update product favorite')
      return reply.error('failed to update product favorite status')
    }
  })

  /**
   * @route PUT /api/v1/products/:id/description
   */
  fastify.put('/:id/description', async (request: FastifyRequest<{
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
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const repo = new Product()
      const id = request.params.id
      const usercode = +request.query.usercode

      const product = await repo.getBase(id, usercode, 'nl')
      const customer = await repo.getUserSettings(usercode)

      if (product && customer) {
        const successfully = await repo.putDescription(id, customer.customer_id, customer.address_id, request.body.description)
        if (successfully)
          return reply.success({ success: successfully })

        request.log.warn('Failed to update database record')
        return reply.fail({ success: successfully, reason: 'Failed to update database record' })
      }

      request.log.error({ product_id: id, usercode }, 'product or customer not found')
      return reply.error('product or customer not found', 404)
    } catch (err) {
      request.log.error({ err }, 'failed to update product description')
      return reply.error('failed to update product description')
    }
  })

  /**
   * @route DELETE /api/v1/products/:id/description
   */
  fastify.delete('/:id/description', async (request: FastifyRequest<{
    Params: {
      id: number
    },
    Querystring: {
      usercode: string
    }
  }>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)
      const repo = new Product()
      const id = request.params.id
      const usercode = +request.query.usercode

      const product = await repo.getBase(id, usercode, 'nl')
      const customer = await repo.getUserSettings(usercode)

      if (product && customer) {
        const successfully = await repo.deleteDescription(id, customer.customer_id, customer.address_id)
        if (successfully)
          return reply.success({ success: successfully })

        request.log.warn('Failed to remove database record')
        return reply.fail({ success: successfully, reason: 'Failed to remove database record' })
      }

      request.log.error({ product_id: id, usercode }, 'product or customer not found')
      return reply.error('product or customer not found', 404)
    } catch (err) {
      request.log.error({ err }, 'failed to remove product description')
      return reply.error('failed to remove product description')
    }
  })
}
