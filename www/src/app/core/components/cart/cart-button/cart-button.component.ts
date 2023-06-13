import { ChangeDetectorRef, Component, HostListener, Input } from '@angular/core'
import { CartService } from 'src/app/@shared/layout/buttons/cart/cart.service'
import { AuthService } from 'src/app/auth/auth.service'
import { IProductBase } from 'src/app/core/api/products-api.service'

@Component({
  selector: 'bra-cart-button',
  templateUrl: './cart-button.component.html',
  host: {
    class: 'flex'
  }
})
export class CartButtonComponent {
  @Input() product: IProductBase | undefined = undefined

  @HostListener('click', ['$event'])
  onclick($event: any) {
    $event.preventDefault()
    $event.stopPropagation()
  }

  constructor(
    public auth: AuthService,
    private service: CartService,
    private ref: ChangeDetectorRef
  ) {
    service.changes.subscribe({
      next: () => {
        this.ref.markForCheck()
      }
    })
  }

  add() {
    if (!this.product) return
    this.service.update(this.product, 1)
  }

  removeOne() {
    if (!this.product || !this.currentQuantity) return

    if (this.currentQuantity === 1) {
      const confirmed = confirm('Are you sure you want to remove this product from cart?')
      if (!confirmed) return
    }

    this.service.update(this.product, this.currentQuantity - 1)
  }

  addOne() {
    if (!this.product || !this.currentQuantity) return
    this.service.update(this.product, this.currentQuantity + 1)
  }

  update($event: any) {
    const amount = parseInt($event.target.value)
    if (!this.product || amount === this.currentQuantity) return
    this.service.update(this.product, amount)
  }

  get added() {
    return this.service.products.some(p => p.id === this.product?.id)
  }

  get currentQuantity(): number | undefined {
    return this.service.products.find(p => p.id === this.product?.id)?.quantity
  }

  get amountName(): string {
    return 'product-amount-' + this.product?.id
  }

  get ready(): boolean {
    return this.service.initialized
  }
}
