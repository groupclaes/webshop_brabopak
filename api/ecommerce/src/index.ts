import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import process, { env } from 'process'

import config from './config'
import cartsController from './controllers/carts.controller'
import dashboardController from './controllers/dashboard.controller'
import menuController from './controllers/menu.controller'
import ordersController from './controllers/orders.controller'

let fastify: FastifyInstance | undefined

/** Main loop */
async function main() {
  // add jwt configuration object to config
  fastify = await Fastify({ ...config.wrapper, jwt: {} })
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '')
  await fastify.register(cartsController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/carts` })
  await fastify.register(dashboardController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/dashboard` })
  await fastify.register(menuController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/menu` })
  await fastify.register(ordersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/orders` })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })
}

['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    await fastify?.close()
    process.exit(0)
  })
})

main()