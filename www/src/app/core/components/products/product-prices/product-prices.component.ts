import { CurrencyPipe } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { IProductPrice } from 'src/app/core/api/products-api.service'

@Component({
  selector: 'bra-product-prices',
  templateUrl: './product-prices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class ProductPricesComponent {
  @Input() culture: string = 'nl-BE'
  @Input() unit: string = ''
  @Input('content-unit') content_unit?: { quantity: number, name: string }
  @Input() set prices(value: IProductPrice[]) {
    this._prices = value
    this.ref.markForCheck()
  }

  private _prices?: IProductPrice[]

  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private currencyPipe: CurrencyPipe
  ) { }

  get price(): string | undefined {
    if (this.prices.some((e: any) => e.amount > 0)) {
      let myprice: any = this.prices.find((e: any) => e.quantity === 1)
      return this.currencyPipe.transform(myprice.amount, 'EUR', 'symbol-narrow', '0.2-2', this.culture) ?? undefined
    } else if (this.prices.some((e: any) => e.amount === -1)) {
      return this.translate.instant('price.request')
    }
    return undefined
  }

  get unitPrice(): string | undefined {
    if (this.content_unit && this.prices.some((e: any) => e.amount > 0)) {
      const myprice: any = this.prices.find((e: any) => e.quantity === 1)
      let unit_price = myprice.amount / this.content_unit.quantity
      let price_string = this.currencyPipe.transform(unit_price > 1 ? unit_price : unit_price * 100, 'EUR', 'symbol-narrow', '0.2-2', this.culture)
      if (price_string && unit_price < 1)
        price_string = price_string?.replace('€', '¢')

      if (price_string)
        return `${price_string}/${this.content_unit.name}`
    }
    return undefined
  }

  get unitTitle(): string | undefined {
    if (this.content_unit)
      return `Prijs per ${this.content_unit.name} steeds indicatief, facturatie is altijd per ${this.unit}`
    return undefined
  }

  get prices(): IProductPrice[] {
    return this._prices ?? []
  }
}
