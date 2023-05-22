import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { SearchService } from 'src/app/@shared/layout/buttons/search/search.service'
import { AuthService } from 'src/app/auth/auth.service'
import { ProductsApiService } from 'src/app/core/api/products-api.service'
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

  loading: boolean = true

  per_page: number = 16
  pages: any
  has_first: boolean = false
  has_previous: boolean = false
  has_next: boolean = false
  has_last: boolean = false
  breadcrumbs: string[] = ['Producten']
  category_id: number | undefined

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private products: ProductsApiService,
    private translate: TranslateService,
    private ref: ChangeDetectorRef,
    private searchService: SearchService,
    // private filterService: FilterService
  ) {
  }

  ngOnInit() {
    this._subs.push(this.route.params.subscribe((params: Params) => {
      this.breadcrumbs = ['Producten']
      Object.keys(params).forEach((key: string) => {
        this.breadcrumbs.push(this.capitalize(params[key].replace(/-/g, ' ')))
      })
      this.ref.markForCheck()
    }))
    this._subs.push(this.route.queryParams.subscribe((params: Params) => {
      if (params['id']) {
        this.category_id = +params['id']
      }
      if (params['page']) {
        this.load(+params['page'])
        return
      }
      this.load()
    }))

    this.searchService.change.subscribe(() => {
      this.load()
    })
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy()')
    if (this._subs)
      this._subs.forEach(s => s.unsubscribe())
  }

  async load(page: number = 0) {
    try {
      const category_id = this.category_id
      const query = this.searchService.current
      const response = await this.products.search(
        this.auth.id_token?.usercode,
        {
          page,
          per_page: this.per_page,
          category_id,
          query
          // oFavorites: true
        })

      this._products = response.products
      this.calcpages(response.productCount)
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

  calcpages(itemCount: number) {
    // page is a 0 based value => add 1
    let page = /* this.filterService.Page || */ 0
    page++
    this.pages = []
    this.pages.push(page)

    let maxPagesCount = Math.ceil(itemCount / this.per_page)
    if (maxPagesCount === 0) {
      maxPagesCount = 1
    }

    if (page > maxPagesCount) {
      // this.filterService.Page = undefined
      page = 1
    } else if (page < 1) {
      // if (!this.filterService.Page) {
      //   return
      // }
      // this.filterService.Page = undefined
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
    // this.filterService.setPage(page)
    this.load(page)
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
