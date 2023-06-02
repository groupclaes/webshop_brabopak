import { EventEmitter, Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService, ICartProduct } from 'src/app/core/api/ecommerce-api.service'
import { IProductBase } from 'src/app/core/api/products-api.service'

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _initialized: boolean = false

  private _products: ICartProduct[] = []

  changes: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private translate: TranslateService
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
      const response = await this.api.cart(this.auth.id_token?.usercode)
      this._initialized = true

      this._products = response[0].products

      this.changes.emit()
    } catch (err) {
      console.debug('CartService.init() -- catch')
      console.error(err)
    } finally {
      console.debug('CartService.init() -- finally')
    }
  }

  async update(product: IProductBase, quantity: number): Promise<void> {
    if (quantity > 0 && !(this.validateQuantity(product, quantity) || product.type !== 'B')) {
      return
    }

    const response = await this.api.putCartProduct({ product_id: product.id, quantity }, this.auth.id_token?.usercode)
    this._products = response[0].products
    this.changes.emit()
  }

  private validateQuantity(product: IProductBase, quantity: number): boolean {
    if (quantity < product.minimum_order_quantity) {
      const correctqty = product.minimum_order_quantity
      this.openDialog(this.translate.instant('errors.minimum_order_quantity', { correctqty: correctqty }), product, correctqty)
      return false
    } else if (((quantity - product.minimum_order_quantity) % product.stack_size) !== 0) {
      const correctqty = quantity + product.stack_size - ((quantity - product.minimum_order_quantity) % product.stack_size)
      this.openDialog(this.translate.instant('errors.stack_size', { stack_size: product.stack_size, correctqty: correctqty }), product, correctqty)
      return false
    }
    return true
  }

  openDialog(bodytext: string, product: IProductBase, correctqty: number): void {
    const result = window.confirm(bodytext)

    if (result === true) {
      this.update(product, correctqty)
      return
    }
  }

  get initialized(): boolean {
    return this._initialized
  }

  get productCount(): number {
    return this._products.length
  }

  get products(): ICartProduct[] {
    return this._products
  }
}