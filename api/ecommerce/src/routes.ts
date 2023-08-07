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
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'POST',
  url: '/carts',
  handler: cartsController.post,
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'PUT',
  url: '/carts/products',
  handler: cartsController.put,
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'GET',
  url: '/orders/:id',
  handler: ordersController.get,
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'GET',
  url: '/orders',
  handler: ordersController.getHistory,
  requiredPermissions: [
    undefined
  ]
}, {
  method: 'GET',
  url: '/dashboard',
  handler: dashboardController.get,
  requiredPermissions: [
    undefined
  ]
}]