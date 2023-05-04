import { CurrencyPipe } from '@angular/common'
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from 'src/app/auth/auth.service'
import { PcmApiService } from 'src/app/core/api/pcm-api.service'
import { ProductsApiService } from 'src/app/core/api/products-api.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'bra-product-page',
  templateUrl: './product-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class ProductPageComponent {
  private _product: any
  private _images: any[] | undefined
  private _attachments: any[] | undefined

  private _active_image: number = 0


  availableLimit: Date = new Date(2050, 11, 31)
  loading: boolean = true

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private products: ProductsApiService,
    private pcm: PcmApiService,
    private auth: AuthService,
    private currencyPipe: CurrencyPipe
  ) {
    this.route.params.subscribe(params => {
      if (params['id'] && params['name']) {
        const id = +params['id']
        // const name = params['name'].replace(/---/g, ' - ').replace(/-/g, ' ')

        this.load(id)
      }
    })
  }

  async load(id: number) {
    try {
      const response = await this.products.get({
        id,
        token: this.auth.id_token?.token,
        usercode: this.auth.id_token?.usercode,
        culture: this.culture.split('-')[0]
      })

      this._product = response.product
      // this._product.features = [
      //   "Haal meer uit elk servet: deze papierservetten voor eenmalig gebruik zijn groter als ze uitgevouwen zijn.",
      //   "Verbeter de hygiëne: dankzij de volledig gesloten servetdispenser raken gasten alleen de servetten aan die ze gebruiken.",
      //   "Bespaar tijd en ruimte én verbeter de hygiëne met onze unieke verpakkingsoplossing voor servetvullingen.",
      //   "Verminder verspilling van dinerservetten: één - per - keer - dosering helpt u verbruik en kosten te controleren.",
      //   "Leveringsomvang: 8 bundels à 1125 servetten, 1-laags, Universal- kwaliteit.Geschikt voor Tork N4- servettendispensers."
      // ]

      this.loadResources()
    } catch (err) {
      console.log('Error loading product data', err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  async loadResources() {
    try {
      const requests = Promise.all([this.pcm.getProductImagesList(this.product.itemNum, this.culture.split('-')[0]), this.pcm.getObjectList(this._product.itemNum)])
      const resources = await requests
      this._images = resources[0].results

      this._attachments = resources[1].results.filter(e => e.documentType !== 'display-image')
      if (!this._product.favorite || !this._product.favorite[0].lastDateBought) {
        this._attachments = this._attachments.filter(e => e.documentType !== 'datasheet')
      }
      this._active_image = 0
    } catch (err) {
      console.log('Error loading product data', err)
    } finally {
      this.ref.markForCheck()
    }
  }

  activateImage(index: number) {
    this._active_image = index
    this.ref.markForCheck()
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-').toLowerCase()
  }

  get featuresExpanded(): boolean {
    return true
  }

  get isFood(): boolean {
    if (this._product) {
      if (this._product.itemNum) {
        const itemnum = parseInt(this._product.itemNum.toString().substring(0, 3), 10)
        if (itemnum <= 136) {
          return true
        }
      }
    }
    return false
  }

  get product(): any {
    return this._product
  }

  get basePrice(): string | null {
    if (this.auth.isAuthenticated()) {
      if (this._product.prices && this._product.prices.some((e: any) => e.amount > 0)) {
        let myprice: any = this._product.prices.find((e: any) => e.quantity === 1)
        return this.currencyPipe.transform(myprice.basePrice, 'EUR', 'symbol-narrow', '0.2-2', 'nl-BE')
      } else if (this._product.prices.some((e: any) => e.amount === -1)) {
        return this.translate.instant('price.request')
      }
    }
    return null
  }

  get images(): any[] {
    return this._images || []
  }

  get attachments(): any[] {
    return this._attachments || []
  }

  get activeImage(): string | undefined {
    if (this._images) {
      return this._images[this._active_image].guid
    }
    return undefined
  }

  get culture(): string {
    return environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) || environment.defaultLanguage
  }
}
