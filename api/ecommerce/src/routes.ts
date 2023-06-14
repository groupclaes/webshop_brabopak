import * as menuController from './controllers/menu.controller'
import * as cartsController from './controllers/carts.controller'
import * as dashboardController from './controllers/dashboard.controller'

export default [{
  method: 'GET',
  url: '/menu',
  handler: menuController.get
}, {
  method: 'GET',
  url: '/carts',
  handler: cartsController.get,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/carts',
  handler: cartsController.post,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/carts/products',
  handler: cartsController.put,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/dashboard',
  handler: dashboardController.get,
  requiredPermissions: []
}]