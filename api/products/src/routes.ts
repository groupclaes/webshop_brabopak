import * as productsController from './controllers/products.controller'

export default [{
  method: 'GET',
  url: '/:id',
  handler: productsController.get,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/:id/base',
  handler: productsController.getBase,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/:id/favorite',
  handler: productsController.putFavorite,
  requiredPermissions: []
}]