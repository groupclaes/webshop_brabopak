import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import process, { env } from 'process'
import path from 'path'

import config from './config'
import authorizeController from './controllers/authorize.controller'
import tokenController from './controllers/token.controller'
import usersController from './controllers/users.controller'

let fastify: FastifyInstance | undefined

const LOGLEVEL = 'debug'

/** Main loop */
async function main() {
  // add jwt configuration object to config
  fastify = await Fastify({ ...config.wrapper, jwt: {} })
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '')

  fastify.register(
    require('@fastify/static'),
    {
      root: path.join(__dirname, '.well-known'),
      prefix: version_prefix + '/sso/.well-known/' // optional: default '/'
    }
  )
  await fastify.register(authorizeController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/authorize`, logLevel: LOGLEVEL })
  await fastify.register(tokenController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/token`, logLevel: LOGLEVEL })
  await fastify.register(usersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/users`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })
}

['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    await fastify?.close()
    process.exit(0)
  })
})

main()