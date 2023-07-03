import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { CartService } from 'src/app/@shared/layout/buttons/cart/cart.service'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service'

@Component({
  selector: 'bra-cart-copy-page',
  templateUrl: './cart-copy-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartCopyPageComponent {
  isLoading: boolean = false
  actionForm: FormGroup

  id: any
  order: any

  current: any[] = []
  target: any[] = []

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private cart: CartService,
    private router: Router,
    fb: FormBuilder,
    route: ActivatedRoute
  ) {
    this.actionForm = fb.group({
      action: ['merge', Validators.required]
    })

    this.actionForm.valueChanges.subscribe((ev: { action: string }) => {
      this.calculateCartImpact(ev.action)
    })

    route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.id = +params['orderId']
        this.loadCart('order', this.id)
      }
    })
  }

  ngOnInit(): void {
    this.cart.changes.subscribe(() => {
      // get current cart to init current
      if (this.cart.products.length > 0) {
        this.current = this.cart.products.map(product => ({
          id: product.id,
          count: product.quantity,
          itemNum: product.itemnum,
          itemName: product.name
        }))
      } else {
        this.current = []
      }

      this.calculateCartImpact('merge')
    })

    this.ref.markForCheck()
    // get current cart to init current
    if (this.cart.products.length > 0) {
      this.current = this.cart.products.map(product => ({
        id: product.id,
        count: product.quantity,
        itemNum: product.itemnum,
        itemName: product.name
      }))
    } else {
      this.current = []
    }

    this.calculateCartImpact('merge')
  }

  async loadCart(type: string, id: any): Promise<void> {
    switch (type) {
      case 'order':
        try {
          const apiResponse = await this.api.order(id, this.auth.currentCustomer?.usercode || 0)

          if (apiResponse && apiResponse.code === 200) {
            const order = apiResponse.data.orders[0]
            // remove line wich are no longer available
            order.orderLines = order.orderLines.filter((e: any) => !e.isUnavailable)
            this.order = order
          }
        } catch { } finally {
          this.isLoading = false
          this.calculateCartImpact('merge')
          this.ref.markForCheck()
        }
        break

      default:
        alert(new Error('Unknown cart type!'))
        break
    }
  }

  calculateCartImpact(type: string) {
    switch (type) {
      case 'replace':
        if (this.order) {
          this.target = this.order.orderLines.map((product: any) => ({
            id: product.id,
            count: product.count,
            itemNum: product.itemNum,
            itemName: product.itemName,
            change: this.findCountChange(product.id, null, product.count)
          }))

          // add missing lines to target
          const temp: any[] = []
          this.current.forEach((product, index, arr) => {
            // check if is in target
            if (!this.target.find(e => e.id === product.id)) {
              temp.push({
                id: product.id,
                count: 0,
                itemNum: product.itemNum,
                itemName: product.itemName,
                change: this.findCountChange(product.id, null, 0)
              })
            }

            if (index === arr.length - 1) {
              temp.forEach((v, i) => {
                this.target.splice(i, 0, v)
              })
              this.ref.markForCheck()
            }
          })
        }
        break

      case 'merge':
        if (this.order) {
          this.target = this.order.orderLines.map((product: any) => ({
            id: product.id,
            count: this.findCountSum(product.id, null, product.count),
            itemNum: product.itemNum,
            itemName: product.itemName,
            change: product.count
          }))

          // add missing lines to target
          const temp: any[] = []
          this.current.forEach((product, index, arr) => {
            // check if is in target
            if (!this.target.find(e => e.id === product.id)) {
              temp.push({
                id: product.id,
                count: product.count,
                itemNum: product.itemNum,
                itemName: product.itemName,
                change: this.findCountChange(product.id, null, product.count)
              })
            }

            if (index === arr.length - 1) {
              temp.forEach((v, i) => {
                this.target.splice(i, 0, v)
              })
              this.ref.markForCheck()
            }
          })
        }
        break

      default:
        console.error('Unknow action type!', type)

        // 400 article request err
        // 403 article not allowed
        // 404 article not found
        // 410 article gone
        // 500 article error
        return
    }
    this.ref.markForCheck()
  }

  findCountSum(id: number, itemNum: string | null, count: number) {
    if (id) {
      const prod = this.current.find(e => e.id === id)
      if (prod) {
        return count + prod.count
      }
    } else if (itemNum) {
      const prod = this.current.find(e => e.itemNum === itemNum)
      if (prod) {
        return count + prod.count
      }
    }
    return count
  }

  findCountChange(id: number, itemNum: string | null, count: number) {
    if (id) {
      const prod = this.current.find(e => e.id === id)
      if (prod) {
        return count - prod.count
      }
    } else if (itemNum) {
      const prod = this.current.find(e => e.itemNum === itemNum)
      if (prod) {
        return count - prod.count
      }
    }
    return count
  }

  apply() {
    // check if products are still purchaseable
    this.target.forEach(product => {
      try {
        this.cart.update(product, product.count)
      } catch (err) {
        console.error(err)
      }
    })
    this.router.navigate(['/products'])
  }

  get culture(): string {
    return this.translate.currentLang
  }
}
