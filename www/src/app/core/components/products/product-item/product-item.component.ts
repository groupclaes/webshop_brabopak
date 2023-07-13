import { CurrencyPipe, DatePipe } from '@angular/common'
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from 'src/app/auth/auth.service'
import { IProduct } from 'src/app/core/api/products-api.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'bra-product-item',
  templateUrl: './product-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col w-full cursor-pointer group'
  }
})
export class ProductItemComponent implements OnInit, OnDestroy {
  @Input() item: IProduct | undefined

  availableLimit: Date = new Date(2050, 11, 31)

  constructor(
    private translate: TranslateService,
    public auth: AuthService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  get isNew(): boolean {
    return this.item?.is_new || false
  }

  get isPromo(): boolean {
    if (this.item?.prices) return this.item.prices.some(e => e.is_promo == true)
    return false
  }

  get isFavorite(): boolean {
    return this.auth.isAuthenticated() && this.item?.favorite && (this.item.favorite[0].isFavorite === true || this.item.favorite[0].isFavorite === null) || false
  }

  get currentPrice(): string | null {
    if (this.item?.prices) {
      if (this.item.prices && this.item.prices.some((e: any) => e.amount > 0)) {
        let myprice: any = this.item.prices.find((e: any) => e.quantity === 1)
        return this.currencyPipe.transform(myprice.amount, 'EUR', 'symbol-narrow', '0.2-2', 'nl-BE')
      } else if (this.item.prices.some((e: any) => e.amount === -1)) {
        return this.translate.instant('price.request')
      }
    }
    return null
  }

  get favinfo(): string | null {
    if (this.isFavorite && this.item?.favorite) {
      return `${this.translate.instant('lastbought')}: ${this.datePipe.transform(this.item.favorite[0].lastDateBought, 'dd/MM/yyyy')} ${this.item.favorite[0].lastQuantityBought}x`
    }
    return null
  }

  get availableDescription(): string | null {
    if (this.item?.available_on) {
      if (this.item.available_on?.toISOString() === this.availableLimit.toISOString()) {
        return this.translate.instant('availableOnUnknown')
      }
      return `${this.translate.instant('availableOn')} ${this.datePipe.transform(this.item.available_on, 'dd/MM/yyyy')}`
    }
    return ''
  }

  get culture(): string {
    return environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) || environment.defaultLanguage
  }
}
