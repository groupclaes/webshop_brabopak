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
  method: 'GET',
  url: '/users/customers',
  handler: usersController.getCustomers,
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'POST',
  url: '/users/signon',
  handler: usersController.postSignOn
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
}, {
  method: 'POST',
  url: '/users/reset-password',
  handler: usersController.postRequestPasswordReset
}]