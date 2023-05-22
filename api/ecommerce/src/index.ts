import Fastify from '@groupclaes/fastify-elastic'
const config = require('./config')
import routes from './routes'

const main = async () => {
  const fastify = new Fastify(config.wrapper)
  // fastify.addAuthPreHandler(handle, 'token')
  fastify.routeMultiple(routes)
  await fastify.start()
}

main()