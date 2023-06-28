import * as menuController from './controllers/menu.controller'
import * as cartsController from './controllers/carts.controller'
import * as dashboardController from './controllers/dashboard.controller'
import * as ordersController from './controllers/orders.controller'

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
  url: '/orders/:id',
  handler: ordersController.get,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/orders',
  handler: ordersController.getHistory,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/dashboard',
  handler: dashboardController.get,
  requiredPermissions: []
}]