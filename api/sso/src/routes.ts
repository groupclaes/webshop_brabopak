// SSO controllers
import * as authorizeController from './controllers/authorize.controller'
import * as tokenController from './controllers/token.controller'
import * as usersController from './controllers/users.controller'

export default [{
  method: 'POST',
  url: '/authorize',
  handler: authorizeController.post
}]