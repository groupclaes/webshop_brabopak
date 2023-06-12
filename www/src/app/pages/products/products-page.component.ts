import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { SearchService } from 'src/app/@shared/layout/buttons/search/search.service'
import { AuthService } from 'src/app/auth/auth.service'
import { ProductsApiService } from 'src/app/core/api/products-api.service'
import { IBreadcrumb } from 'src/app/core/components/breadcrumbs/breadcrumbs.component'
import { environment } from 'src/environments/environment'

declare var require: any
const capitalize = require('capitalize')

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
  private subscriber: Subscription | undefined

  loading: boolean = true
  init: boolean = false

  per_page: number = 16
  count: number = 0
  pages: any
  has_first: boolean = false
  has_previous: boolean = false
  has_next: boolean = false
  has_last: boolean = false
  breadcrumbs: IBreadcrumb[] = [{ name: 'Producten' }]

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private products: ProductsApiService,
    private translate: TranslateService,
    private ref: ChangeDetectorRef,
    public searchService: SearchService
  ) {
  }

  ngOnInit() {
    console.debug('ProductsPageComponent.ngOnInit()')
    this._subs.push(this.route.params.subscribe((params: Params) => {
      if (!this.init) {
        this.load(this.searchService.current)
        this.init = true
      }
      this.ref.markForCheck()
    }))

    this._subs.push(this.searchService.Refresh.subscribe((reload: boolean) => {
      if (reload) {
        this.load(this.searchService.current)
        this.ref.markForCheck()
      }
    }))
  }

  ngOnDestroy(): void {
    console.debug('ProductsPageComponent.ngOnDestroy()')
    if (this._subs)
      this._subs.forEach(s => s.unsubscribe())
  }

  async load(filters: any) {
    try {
      console.debug('ProductsPageComponent.load() -- try', filters)
      if (this.subscriber && !this.subscriber.closed) {
        this.subscriber.unsubscribe()
      }

      this.subscriber = this.products.search(
        this.auth.id_token?.usercode,
        {
          ...filters,
          per_page: this.per_page
        }).subscribe({
          next: (response) => {
            this._products = response.products
            this.breadcrumbs = [{ name: 'Producten' }]
            this.breadcrumbs = this.breadcrumbs.concat(response.breadcrumbs.map((e: any) => ({ name: this.capitalize(e.name), id: e.id })))
            this.count = response.productCount
            this.calcpages(response.productCount)
            this.searchService.calculatePages(response.productCount)
            this.loading = false
            this.ref.markForCheck()
          }
        })

      // this._product.features = [
      //   "Haal meer uit elk servet: deze papierservetten voor eenmalig gebruik zijn groter als ze uitgevouwen zijn.",
      //   "Verbeter de hygiëne: dankzij de volledig gesloten servetdispenser raken gasten alleen de servetten aan die ze gebruiken.",
      //   "Bespaar tijd en ruimte én verbeter de hygiëne met onze unieke verpakkingsoplossing voor servetvullingen.",
      //   "Verminder verspilling van dinerservetten: één - per - keer - dosering helpt u verbruik en kosten te controleren.",
      //   "Leveringsomvang: 8 bundels à 1125 servetten, 1-laags, Universal- kwaliteit.Geschikt voor Tork N4- servettendispensers."
      // ]
    } catch (err) {
      this.loading = false
      console.log('Error loading product data', err)
    } finally {
      this.ref.markForCheck()
    }
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-').toLowerCase()
  }

  calcpages(itemCount: number) {
    // page is a 0 based value => add 1
    let page = this.searchService.page || 0
    page++
    this.pages = []
    this.pages.push(page)

    let maxPagesCount = Math.ceil(itemCount / this.per_page)
    if (maxPagesCount === 0) {
      maxPagesCount = 1
    }

    if (page > maxPagesCount) {
      this.searchService.page = undefined
      page = 1
    } else if (page < 1) {
      if (!this.searchService.page) {
        return
      }
      this.searchService.page = undefined
      page = 1
    }

    this.has_first = !(page <= 2)
    this.has_previous = (page > 1)
    this.has_next = (page < maxPagesCount)
    this.has_last = (page < maxPagesCount - 1)
    // if first page display 4 next

    let pageLimit = 5
    let currentPosition = 1

    if (page === 1) {
      // the user is on the first page, show 1 - lastpage where lastpage <= 5
      for (let i1 = page + 1; i1 <= maxPagesCount; i1++) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.push(i1)
        currentPosition++
      }
    } else if (page === 2) {
      // the user is on the second page
      this.pages.unshift(1)
      pageLimit = 4
      currentPosition = 1
      for (let i2 = page + 1; i2 <= maxPagesCount; i2++) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.push(i2)
        currentPosition++
      }
    } else if (page === maxPagesCount - 1 && (maxPagesCount > 4)) {
      // user is on the second last page
      this.pages.push(maxPagesCount)
      pageLimit = 4
      currentPosition = 1
      for (let i3 = page - 1; i3 >= 1; i3--) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.unshift(i3)
        currentPosition++
      }
    } else if (page === maxPagesCount) {
      pageLimit = 5
      currentPosition = 1
      for (let i4 = page - 1; i4 >= 1; i4--) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.unshift(i4)
        currentPosition++
      }
    } else {
      pageLimit = 3
      currentPosition = 1

      for (let i = page - 1; i >= 1; i--) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.unshift(i)
        currentPosition++
      }

      currentPosition = 1
      for (let i = page + 1; i <= maxPagesCount; i++) {
        if (currentPosition === pageLimit) {
          break
        }
        this.pages.push(i)
        currentPosition++
      }
    }
  }

  changePage(page: number) {
    page--
    this.searchService.setPage(page)
  }

  capitalize(text: string) {
    return capitalize.words(text, {
      skipWord: /^(en|de|het|et|a|pour|voor|om|van)$/
    })
  }

  get items(): any[] {
    if (this._products !== undefined)
      return this._products
    return []
  }

  get culture(): string {
    return environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) || environment.defaultLanguage
  }
}
