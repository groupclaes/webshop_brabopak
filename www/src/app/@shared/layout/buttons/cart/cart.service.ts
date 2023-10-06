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

  private _id?: number
  private _products: ICartProduct[] = []
  private _modified?: Date

  changes: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private translate: TranslateService
  ) {
    this.auth.change.subscribe({
      next: () => {
        this.init()
      }
    })
    this.auth.customerChange.subscribe({
      next: () => {
        this.init()
      }
    })
    if (this.auth.isAuthenticated()) {
      this.init()
    }
  }

  async init() {
    this._initialized = false
    if (!this.auth.id_token || !this.auth.currentCustomer) {
      this._products = []
      this._modified = undefined
      this.changes.emit()
      return
    }

    try {
      // console.debug('CartService.init() -- try', this.auth.currentCustomer)
      // get carts from api
      const response = await this.api.cart(this.auth.currentCustomer.usercode)

      this._initialized = true
      if (response?.data) {
        this._id = response.data[0].id
        this._products = response.data[0].products ?? []
        this._modified = response.data[0].modified
      } else {
        this._id = undefined
        this._products = []
        this._modified = undefined
      }

      this.changes.emit()
    } catch (err) {
      // console.debug('CartService.init() -- catch')
      console.error(err)
    } finally {
      // console.debug('CartService.init() -- finally')
    }
  }

  async update(product: IProductBase, quantity: number): Promise<void> {
    if (!this.auth.id_token || !this.auth.currentCustomer) return
    if (quantity > 0 && !(this.validateQuantity(product, quantity) || product.type !== 'B') || !this.auth.id_token) {
      return
    }

    const response = await this.api.putCartProduct({ product_id: product.id, quantity }, this.auth.currentCustomer.usercode)
    this._id = response.data[0].id
    this._products = response.data[0].products ?? []
    this._modified = response.data[0].modified
    this.changes.emit()
  }

  async send(form: any): Promise<boolean> {
    if (!this._id) return false

    const response = await this.api.postCart(this._id, form)
    if (response.code === 200)
      await this.init()

    return response.code === 200
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

  private openDialog(bodytext: string, product: IProductBase, correctqty: number): void {
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

  get modified(): Date | undefined {
    return this._modified
  }
}