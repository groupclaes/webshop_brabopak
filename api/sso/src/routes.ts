// SSO controllers
import * as authorizeController from './controllers/authorize.controller'
import * as tokenController from './controllers/token.controller'
import * as usersController from './controllers/users.controller'

export default [{
  method: 'POST',
  url: '/authorize',
  handler: authorizeController.post
}, {
  method: 'GET',
  url: '/token',
  handler: tokenController.get
}, {
  method: 'POST',
  url: '/users/refresh-token',
  handler: usersController.postRefreshToken
}, {
  method: 'POST',
  url: '/users/revoke-token',
  handler: usersController.postRevokeToken
}, {
  method: 'POST',
  url: '/users/update-password',
  handler: usersController.postUpdatePassword
}]