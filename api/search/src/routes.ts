import * as searchController from './controllers/search.controller'

export default [{
  method: 'GET',
  url: '',
  handler: searchController.get,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '',
  handler: searchController.post,
  requiredPermissions: []
}]