import { FastifyRequest, FastifyReply } from 'fastify'
import { success, fail, error } from '@groupclaes/fastify-elastic/responses'
import { JWTPayload } from 'jose'

import oe from '@groupclaes/oe-connector'

import Cart from '../repositories/carts.repository'

// get current cart
export const get = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
    culture?: string
  }
}>, reply: FastifyReply) => {
  const token: JWTPayload = request['token']

  try {
    const repo = new Cart()
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    request.log.debug({ user_id: token.sub }, 'fetching carts')
    const data = await repo.get(usercode, token.sub, culture)

    request.log.debug({ user_id: token.sub, carts_length: data.length }, 'fetched carts')
    return success(reply, data)
  } catch (err) {
    request.log.error({ user_id: token.sub, err }, 'Failed to fetch carts from database')
    return error(reply, 'failed to fetch carts from database')
  }
}

// add / remove product from cart
export const put = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
    culture?: string
  },
  Body: {
    product_id: number,
    quantity: number
  }
}>, reply: FastifyReply) => {
  const token: JWTPayload = request['token']

  try {
    const repo = new Cart()
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    request.log.debug({ usercode, user_id: token.sub, product_id: request.body.product_id, quantity: request.body.quantity }, 'requesting cart update')
    if (token.sub) {
      await repo.updateProduct(usercode, token.sub, request.body.product_id, request.body.quantity)
      request.log.debug({ usercode, user_id: token.sub, product_id: request.body.product_id }, 'cart update success')
    }

    const data = await repo.get(usercode, token.sub, culture)
    return success(reply, data)
  } catch (err) {
    request.log.error({ user_id: token.sub, product_id: request.body.product_id, err }, 'failed to update cart')
    return error(reply, 'failed to update cart')
  }
}

// send cart
export const post = async (request: FastifyRequest<{
  Body: any
}>, reply: FastifyReply) => {
  const token: JWTPayload = request['token']

  try {
    const repo = new Cart()

    request.log.debug({ user_id: token.sub }, 'requesting post cart to openedge')
    if (token.sub) {
      const order: any = request.body
      // get user info from db
      const user = await repo.getUserInfo(token.sub)
      // get cart info from db
      const products: any[] = []

      for (const p of order.products) {
        const info = await repo.getProductInfo(p.id)
        products.push({
          itemnum: info.itemnum,
          quantity: p.quantity,
          unit: info.unit
        })
      }

      const oe_payload = {
        dsOrders: {
          ttOrdMst: [{
            CustNum: order.customer.id,
            DelvAdr: order.customer.address_id,
            CustCol: order.deliveryInfo.method !== 'transport',
            ComplDelv: order.deliveryInfo.option !== 'parts',
            CustRef: order.invoiceInfo.reference,
            DelvDate: undefined,
            NextDelv: order.invoiceInfo.nextDate,
            OrdWay: user.user_type === 1 || user.user_type === 4 ? 's_k' : 's_v'
            //Username: user.username
          }],
          ttOrdDtl: products.map((product, i) => ({
            ItemNum: product.itemnum,
            Qty: product.quantity,
            SalUnit: product.unit,
            TmpOrdLine: i
          })),
          ttOrdMstText: [{
            InfoText: order.invoiceInfo.comment
          }]
        }
      }

      oe.configure({
        c: false
      })

      request.log.debug({ user_id: token.sub, oe_payload, usercode: user.usercode }, 'running apslj110b')
      const oeResponse = await oe.run('apslj110b.p', [
        'BRA',
        oe_payload,
        user.usercode,
        undefined
      ], {
        tw: -1,
        simpleParameters: true,
        parameterDefaults: {
          in: 'string',
          out: 'string'
        }
      })

      request.log.debug({ user_id: token.sub }, 'apslj110b successful')
      if (oeResponse) {
        if (oeResponse.status === 200 && oeResponse.result)
          return success(reply, { success: true })
        else
          return fail(reply, { reason: 'invallid oe response' })
      }
    }

    request.log.debug({ user_id: token.sub, reason: 'no user_id supplied' }, 'Unauthorized')
    return fail(reply, { reason: 'no user_id supplied' }, 401)
  } catch (err) {
    request.log.fatal({ user_id: token.sub, body: request.body, err }, 'failed to send order!')
    return error(reply, 'failed to send order!')
  }
}