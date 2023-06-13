import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from '@angular/core'
import { CartService } from './cart.service'
import { IProductBase } from 'src/app/core/api/products-api.service'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'claes-cart',
  templateUrl: './cart.component.html',
  host: {
    class: 'relative py-3'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  expanded: boolean = false
  timeout: number | undefined

  @HostListener('mouseleave', ['$event'])
  mouseLeave(event: MouseEvent) {
    this.timeout = window.setTimeout(() => {
      this.expanded = false
      this.ref.markForCheck()
    }, 180)

    event.preventDefault()
  }

  @HostListener('mouseenter', ['$event'])
  mouseenter(event: MouseEvent) {
    window.clearTimeout(this.timeout)
    event.preventDefault()
  }

  constructor(
    public service: CartService,
    private ref: ChangeDetectorRef,
    public auth: AuthService
  ) {
    service.changes.subscribe({
      next: () => {
        this.ref.markForCheck()
      }
    })
  }

  toggle() {
    this.expanded = !this.expanded
  }

  calcPrice(product: IProductBase, count: number): myPriceEntry | undefined {
    const price = new myPriceEntry
    if (!product || !product.prices) { return }

    price.stack = count
    price.basePrice = product.prices[0].basePrice

    product.taxes?.forEach((taxEntry: any) => {
      if (taxEntry.type === 'FP') { //  && this.auth.credentials.fostplus === true
        price.baseTax += taxEntry.amount
      } else if (taxEntry.type === null || taxEntry.type !== 'FP') {
        price.baseTax += taxEntry.amount
      }
    })

    if (!product.prices) {
      price.baseDiscountPrice = 0
      price.totalProduct = 0
      price.totalTax = 0
      price.total = 0
      return price
    }

    let curStackSize = 0
    product.prices.forEach((priceEntry: any) => {
      if (priceEntry.quantity >= curStackSize && priceEntry.quantity <= price.stack) {
        curStackSize = priceEntry.quantity
        price.baseDiscountPrice = priceEntry.amount
      }
    })

    price.totalProduct = price.stack * price.baseDiscountPrice
    price.totalTax = price.stack * price.baseTax
    price.total = price.totalProduct + price.totalTax
    return price
  }

  itemName(product: IProductBase) {
    return product.name.replace(/ /g, '-').toLowerCase()
  }

  get calcTotalPrice(): myPriceTotalEntry {
    // calculate totals and discounts
    const totprice = new myPriceTotalEntry
    for (let i = 0; i < this.service.products.length; i++) {
      const product = this.service.products[i]
      if (!product) continue
      const prodPrice = this.calcPrice(product, product.quantity)
      if (!prodPrice) continue
      totprice.totalProduct += prodPrice.basePrice * prodPrice.stack
      totprice.totalDiscount += (prodPrice.basePrice * prodPrice.stack) - (prodPrice.baseDiscountPrice * prodPrice.stack)

      totprice.totalDelivery = 0 // this.selectDelivery(totprice.totalProduct - totprice.totalDiscount)

      totprice.totalTax += prodPrice.totalTax
      totprice.total = (totprice.totalProduct - totprice.totalDiscount) + totprice.totalTax + totprice.totalDelivery
    }
    return totprice
  }

  get contents(): number {
    return this.service.productCount
  }
}

export class myPriceEntry {
  basePrice = 0
  baseDiscountPrice = 0
  baseTax = 0
  totalProduct = 0
  totalTax = 0
  total = 0
  stack = 0
  discount = 0
}

export class myPriceTotalEntry {
  totalProduct = 0
  totalDiscount = 0
  totalDelivery = 0
  totalTax = 0
  total = 0
}