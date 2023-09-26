import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import process, { env } from 'process'

import config from './config'
import usersController from './controllers/users.controller'
import productsController from './controllers/products.controller'

let fastify: FastifyInstance | undefined

/** Main loop */
async function main() {
  // add jwt configuration object to config
  fastify = await Fastify({ ...config.wrapper, jwt: {} })
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '')
  await fastify.register(usersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/users`, logLevel: 'info' })
  await fastify.register(productsController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/products`, logLevel: 'info' })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })
}

['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    await fastify?.close()
    process.exit(0)
  })
})

main()

