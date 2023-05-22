import * as menuController from './controllers/menu.controller'

export default [{
  method: 'GET',
  url: '/menu',
  handler: menuController.get
}]