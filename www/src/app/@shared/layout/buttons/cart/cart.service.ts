import { Injectable } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service'

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _initialized: boolean = false

  private _products: {
    product_id: number,
    quantity: number
  }[] = []

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService
  ) {
    console.log('CartService')
    this.auth.change.subscribe({
      next: (subject) => {
        console.log(subject)
        this.init()
      }
    })
    if (this.auth.isAuthenticated()) {
      this.init()
    }
  }

  async init() {
    try {
      console.debug('CartService.init() -- try')
      // get carts from api
      const response = await this.api.carts()
      this._initialized = true
    } catch (err) {
      console.debug('CartService.init() -- catch')
      console.error(err)
    } finally {
      console.debug('CartService.init() -- finally')
    }
  }

  update(product_id: number, quantity: number): void {
    // all logic will be server side, on update the server return the complete product list again
    if (quantity < 1) {
      console.debug('CartService.update() -- remove product', product_id)
      this._products.forEach((product, index) => {
        if (product.product_id === product_id) {
          this._products.splice(index, 1)
        }
      })
    }

    else if (quantity > 0) {
      console.debug('CartService.update() -- update product quantity', product_id, quantity)
      const record = this._products.find(e => e.product_id === product_id)
      if (record)
        record.quantity = quantity
      else
        this._products.push({ product_id, quantity })
    }

    else {
      console.debug('CartService.update() -- nothing to do')
    }
  }

  get initialized(): boolean {
    return this._initialized
  }
}
