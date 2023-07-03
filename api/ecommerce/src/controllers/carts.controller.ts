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

    const data = await repo.get(usercode, token.sub, culture)

    return {
      status: 'success',
      code: 200,
      data
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to fetch carts from database'
      })
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
      await repo.updateProduct(usercode, token.sub, request.body.product_id, request.body.quantity)
    }

    const data = await repo.get(usercode, token.sub, culture)
    return {
      status: 'success',
      code: 200,
      data
    }
  } catch (err) {
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to update cart'
      })
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
          status: 'success',
          data: {
            success: true
          }
        }
      }
    }

    return reply
      .status(401)
      .send({ 
        status: 'fail',
        code: 401,
        message: 'Unauthorized'
       })
  } catch (err) {
    request.log.fatal(request.body, 'failed to send order!')
    return reply
      .status(500)
      .send({
        status: 'error',
        code: 500,
        message: 'failed to update cart'
      })
  }
}