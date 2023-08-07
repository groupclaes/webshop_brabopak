import Fastify from '@groupclaes/fastify-elastic'
import handle from '@groupclaes/fastify-authhandler'

import routes from './routes'

(async () => {
  const fastify = new Fastify(require('./config').wrapper)
  fastify.addAuthPreHandler(handle, 'token')
  fastify.routeMultiple(routes)
  await fastify.start()
})()