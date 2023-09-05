import { ChangeDetectorRef, Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { myPriceEntry, myPriceTotalEntry } from 'src/app/@shared/layout/buttons/cart/cart.component'
import { CartService } from 'src/app/@shared/layout/buttons/cart/cart.service'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { AuthService } from 'src/app/auth/auth.service'
import { ICartProduct } from 'src/app/core/api/ecommerce-api.service'
import { IProductBase, IProductPrice } from 'src/app/core/api/products-api.service'

@Component({
  selector: 'bra-cart-page',
  templateUrl: './cart-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
  ]
})
export class CartPageComponent implements OnInit, OnDestroy {
  currentStep = 1
  final: any = {}
  orderLoading = true
  isLoading: boolean = true

  deliveryConfirmFormGroup: FormGroup = this.fb.group({
    customerReference: [''],
    deliverOption: [false],
    deliveryMethod: ['transport', Validators.required],
    deliveryOption: ['parts', Validators.required],
    deliveryDate: [null, Validators.required],
    comments: ['']
  })
  finalConfirmFormGroup: FormGroup | undefined
  deliverTimes: Date[] | undefined

  subs: Subscription[] = []

  constructor(
    private ref: ChangeDetectorRef,
    public service: CartService,
    private fb: FormBuilder,
    public auth: AuthService,
    private modalCtrl: ModalsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.subs.push(this.service.changes.subscribe({
      next: () => {
        setTimeout(() => {
          this.ref.markForCheck()
        }, 180)
      }
    }))
    this.subs.push(this.auth.customerChange.subscribe({
      next: () => {
        this.proceedCheckout(1)
      }
    }))
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe())
  }

  proceedCheckout(stepIndex: number) {
    if (stepIndex === 2) {
      if (this.hasOrderItem)
        this.finalConfirmFormGroup = this.fb.group({
          termsAccepted: [false, Validators.requiredTrue],
          orderItemAccepted: [!this.hasOrderItem, Validators.requiredTrue]
        })
      else
        this.finalConfirmFormGroup = this.fb.group({
          termsAccepted: [false, Validators.requiredTrue]
        })
    }
    this.isLoading = false
    this.currentStep = stepIndex
    this.ref.markForCheck()
  }

  calcPrice(product: IProductBase, count: number): myPriceEntry {
    const price = new myPriceEntry
    if (!product || !product.prices) { return price }

    price.stack = count
    price.basePrice = product.prices[0].base

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
    product.prices.forEach((priceEntry: IProductPrice) => {
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

  async sendOrder() {
    if ((this.finalConfirmFormGroup && this.finalConfirmFormGroup.invalid) || this.isLoading) {
      this.finalConfirmFormGroup?.markAllAsTouched()
      const modal = new Modal('alert', 'Formulier ongeldig', 'Controleer als alle velden zijn ingevuld en probeer opnieuw!')
      this.modalCtrl.show(modal)
      return
    }
    if (!this.finalConfirmFormGroup) return

    try {
      this.isLoading = true
      this.ref.markForCheck()

      await this.service.send(this.final)
      const modal = new Modal('success', 'Order verstuurd', 'Het order is verzonden je ontvangt een orderbevestiging wanneer jouw order is verwerkt!')
      await this.modalCtrl.show(modal)
      this.router.navigateByUrl('/')
    } catch (err) {
      console.error(err)
    } finally {
      this.isLoading = false
      this.ref.markForCheck()
    }
  }

  finalizeOrder() {
    this.orderLoading = true
    this.final.products = []

    // get products and calculate prices
    const requests = this.service.products.map((item: any) => {
      return new Promise((resolve) => {
        this.asyncFunction(item, resolve)
      })
    })
    // check deliverdate
    Promise.all(requests).then(async () => {
      // create promises async
      // invoice info
      const customer = this.auth.currentCustomer
      if (!customer) {
        this.auth.refresh().subscribe(() => {
          this.finalizeOrder()
        })
        return
      }

      this.final.customer = customer
      this.final.invoiceInfo = {
        name: (customer.address_id === 0) ? customer.name : customer.address_name,
        address: (customer.address_id === 0) ? `${customer.address} ${customer.street_number}` : `${customer.address_address} ${customer.address_street_number}`,
        city: (customer.address_id === 0) ? customer.city : customer.address_city,
        zipCode: (customer.address_id === 0) ? customer.zip_code : customer.address_zip_code,
        country: (customer.address_id === 0) ? customer.country : customer.address_country,
        reference: this.deliveryConfirmFormGroup.controls['customerReference'].value,
        comment: this.deliveryConfirmFormGroup.controls['comments'].value
      }
      this.final.deliveryInfo = {
        name: (customer.address_id === 0) ? customer.name : customer.address_name,
        address: (customer.address_id === 0) ? `${customer.address} ${customer.street_number}` : `${customer.address_address} ${customer.address_street_number}`,
        city: (customer.address_id === 0) ? customer.city : customer.address_city,
        zipCode: (customer.address_id === 0) ? customer.zip_code : customer.address_zip_code,
        country: (customer.address_id === 0) ? customer.country : customer.address_country,
        method: this.deliveryConfirmFormGroup.controls['deliveryMethod'].value,
        option: this.deliveryConfirmFormGroup.controls['deliveryOption'].value,
        date: undefined,
        nextDate: this.deliveryConfirmFormGroup.controls['deliverOption'].value,
        // cartId: this.service.
      }
      this.final.orderInfo = []
      // this.final.cartId = this.cart.getCart().id

      this.orderLoading = false
      this.ref.markForCheck()

      // if ("ga" in window) {
      //   this.cart.products.forEach((product => {
      //     ga('ec:addProduct', {
      //       'id': this.productInfos[product.productId].itemNum.toString(), // Product ID (string).
      //       'name': this.productInfos[product.productId].name,             // Product name (string).
      //       'category': 'none',                                            // Product category (string).
      //       'brand': 'none',                                               // Product brand (string).
      //       'variant': this.productInfos[product.productId].packingUnit,   // Product variant (string).
      //       'price': product.productPrice,                                 // Product price (currency).
      //       'quantity': product.productCount                               // Product quantity (number).
      //     })
      //   }))
      //   ga('ec:setAction', 'checkout', {
      //     'step': 1,                               // A value of 1 indicates this action is first checkout step.
      //     'option': this.final.deliveryInfo.method // Specify info about a checkout stage, e.g. payment method.
      //   })
      // }
    })
    this.ref.markForCheck()
  }

  asyncFunction(item: ICartProduct, cb: any) {
    let product: any = {}
    product.count = item.quantity
    const pprice = this.calcPrice(product, product.count)
    product.priceDetail = pprice
    this.final.products.push({
      id: item.id,
      quantity: item.quantity,
      price: pprice.baseDiscountPrice,
      basePrice: pprice.basePrice,
      discount: pprice.discount,
      tax: pprice.baseTax,
      desc: product.name
    })
    cb()
    this.ref.markForCheck()
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

  get hasOrderItem() {
    return this.service.products.some(e => e.type === 'B')
  }
}
