import { FastifyRequest, FastifyReply } from 'fastify'
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
  try {
    const repo = new Cart()
    const token: JWTPayload = request['token'] || { sub: null }
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    return await repo.get(usercode, token.sub, culture)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
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
  try {
    const repo = new Cart()
    const token: JWTPayload = request['token'] || { sub: null }
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'

    if (token.sub) {
      const resp = await repo.updateProduct(usercode, token.sub, request.body.product_id, request.body.quantity)
    }

    return await repo.get(usercode, token.sub, culture)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

// send cart
export const post = async (request: FastifyRequest<{
  Body: any
}>, reply: FastifyReply) => {

  try {
    const repo = new Cart()
    const token: JWTPayload = request['token'] || { sub: null }

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
            OrdWay: 'B2B',
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

      if (oeResponse && oeResponse.status === 200 && oeResponse.result) {
        return {
          success: true
        }
      }
    }

    return reply
      .status(401)
      .send({ error: 'Unauthorized!' })
  } catch (err) {
    request.log.fatal(request.body, 'failed to send order!')
    return reply
      .status(500)
      .send(err)
  }
}

// get order history (from RAW)
export const getHistory = async (request: FastifyRequest<{
  Querystring: {
    usercode: number
  }
}>, reply: FastifyReply) => {
  try {
    const repo = new Cart()
    const token: JWTPayload = request['token'] || { sub: null }

    if (token.sub) {
      const user = await repo.getUserInfo(token.sub)
      const customer = await repo.getUserSettings(request.query.usercode)

      oe.configure({
        c: false,
        tw: -1,
        simpleParameters: true
      })

      let oeResponse = await oe.run('getOrderHis', [
        'BRA',
        'user',
        customer.customer_id,
        customer.address_id,
        25,
        undefined
      ])

      request.log.info({ token, customer_id: customer.customer_id, address_id: customer.address_id, user, customer }, 'Get orders history')

      if (oeResponse && oeResponse.status === 200) {
        const orders = oeResponse.result.orders
        if (orders) {
          return { statusCode: 200, length: orders.length, orders }
        } else {
          return reply
            .code(204)
            .send()
        }
      }

      return reply
        .code(oeResponse.status)
        .send(oeResponse)
    }

    return reply
      .status(401)
      .send({ error: 'Unauthorized!' })
  } catch (err) {
    request.log.fatal(request.body, 'failed to send order!')
    return reply
      .status(500)
      .send(err)
  }
}