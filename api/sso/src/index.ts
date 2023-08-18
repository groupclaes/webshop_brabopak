import path from 'path'
import { env } from 'process'

import Fastify from '@groupclaes/fastify-elastic'
import handle from '@groupclaes/fastify-authhandler'
import config from './config'
import routes from './routes'

/** Main loop */
const main = async () => {
  const fastify = new Fastify(config.wrapper)
  fastify.addAuthPreHandler(handle)
  fastify.routeMultiple(routes)

  const wk = env.APP_VERSION ? '/' + env.APP_VERSION : ''
  fastify.server.register(
    require('@fastify/static'),
    {
      root: path.join(__dirname, '.well-known'),
      prefix: wk + '/sso/.well-known/' // optional: default '/'
    }
  )

  await fastify.start()
}

main()