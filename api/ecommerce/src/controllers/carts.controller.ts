import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'

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
  }[]
}>, reply: FastifyReply) => {
  try {
    const repo = new Cart()
    const token: JWTPayload = request['token'] || { sub: null }
    const usercode = request.query.usercode
    const culture = request.query.culture ?? 'nl'



  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

// send cart
export const post = async (request: FastifyRequest<{
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



  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}