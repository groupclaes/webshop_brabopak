import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { AuthService } from 'src/app/auth/auth.service'
import { ProductsApiService } from 'src/app/core/api/products-api.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'bra-page-products',
  templateUrl: './products-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  private _subs: Subscription[] = []
  private _products: any[] | undefined

  loading: boolean = true

  breadcrumbs: string[] = ['Producten']

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private products: ProductsApiService,
    private translate: TranslateService,
    private ref: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    console.log('ngOnInit()')
    this._subs.push(this.route.params.subscribe((params: Params) => {
      this.breadcrumbs = ['Producten']
      Object.keys(params).forEach((key: string) => {
        console.log('key: ' + key, params[key])
        this.breadcrumbs.push(params[key].replace(/-/g, ' '))
      })
      this.ref.markForCheck()
    }))
    this._subs.push(this.route.queryParams.subscribe((params: Params) => {
      if (params['id']) {
        this.load(+params['id'])
      }
    }))
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy()')
    if (this._subs)
      this._subs.forEach(s => s.unsubscribe())
  }



  async load(id: number) {
    try {
      const response = await this.products.search(
        this.auth.id_token?.token,
        this.auth.id_token?.usercode,
        {
          page: 0,
          perPage: 16,
          category: 893
          // category: 1003,
          // oFavorites: true
        })

      console.log(`There are ${response.productCount} products available for search, we can display ${response.products.length} results`)

      this._products = response.products
      // this._product.features = [
      //   "Haal meer uit elk servet: deze papierservetten voor eenmalig gebruik zijn groter als ze uitgevouwen zijn.",
      //   "Verbeter de hygiëne: dankzij de volledig gesloten servetdispenser raken gasten alleen de servetten aan die ze gebruiken.",
      //   "Bespaar tijd en ruimte én verbeter de hygiëne met onze unieke verpakkingsoplossing voor servetvullingen.",
      //   "Verminder verspilling van dinerservetten: één - per - keer - dosering helpt u verbruik en kosten te controleren.",
      //   "Leveringsomvang: 8 bundels à 1125 servetten, 1-laags, Universal- kwaliteit.Geschikt voor Tork N4- servettendispensers."
      // ]
    } catch (err) {
      console.log('Error loading product data', err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-').toLowerCase()
  }

  get items(): any[] {
    return this._products ?? []
  }

  get culture(): string {
    return environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) || environment.defaultLanguage
  }
}
