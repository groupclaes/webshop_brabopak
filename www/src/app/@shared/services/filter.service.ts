import { Injectable } from '@angular/core'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Observable, Subject } from 'rxjs'
import { filter, shareReplay } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private _page: number | undefined = 0
  private _query: string | undefined = ''
  private _favorites: boolean | undefined = false
  private _promo: boolean | undefined = false
  private _new: boolean | undefined = false
  private _attributes: number[] = []
  private _items = 48
  private _department: number | undefined
  private _categoryId: number | undefined = 0
  private _pageCount: number = 0
  private _itemNum: string | undefined
  private _salUnit: string | undefined
  private _ux: string | undefined
  private _set: string | undefined

  // for prod page
  private _productId: number | undefined

  private _catSub = new Subject<number>()
  private _refreshSub = new Subject<boolean>()
  private _refreshMenuSub = new Subject<boolean>()

  constructor(
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.init()
  }

  init() {
    // check location and set values
    this.route.queryParams.subscribe(params => {
      // keep temp compy of object to check changes
      let newPage = +params['page'] > 0 ? +params['page'] : undefined
      const newQuery = (params['query']) ? params['query'] : undefined
      const newFavorites = (params['favorites'] === 'true') ? true : undefined
      const newPromo = (params['promo'] === 'true') ? true : undefined
      const newNew = (params['new'] === 'true') ? true : undefined
      let productId: number | undefined = parseInt(params['productId'], 10)
      const itemNum = params['itemNum']
      const salUnit = params['salUnit']
      const newDepartment = params['department']
      const newAttributes: number[] = []
      const set = params['set'] ? params['set'] : undefined

      if (params['ux']) {
        this._ux = params['ux']
      }

      if (params['attributes'] && params['attributes'].length > 0) {
        if (Array.isArray(params['attributes'])) {
          for (let i = 0; i < params['attributes'].length; i++) {
            newAttributes.push(parseInt(params['attributes'][i], 10))
          }
        } else {
          newAttributes.push(parseInt(params['attributes'], 10))
        }
      }
      if (isNaN(productId)) {
        productId = undefined
      }

      if (newPage === this._page && newQuery === this._query && newFavorites === this._favorites && newNew === this._new && newPromo === this._promo && newPromo === this._promo && newDepartment === this._department && newAttributes.length === this._attributes.length && set === this._set) {
        // filters did not change
      } else {
        // filters have changed, trigger observer and change local values
        this._page = newPage
        this._query = newQuery
        this._favorites = newFavorites
        this._promo = newPromo
        this._new = newNew
        this._attributes = newAttributes
        this._department = newDepartment
        this._productId = productId
        this._itemNum = itemNum
        this._salUnit = salUnit
        this._set = set

        if (this._refreshSub !== undefined) {
          this._refreshSub.next(true)
          this._refreshMenuSub.next(true)
        }
      }
    })

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(r => {
      const ev = r as { url: string }
      if (!ev.url.startsWith('/products') || ev.url === '/products') {
        this.CategoryId = undefined
      }
    })
  }

  applyFilter() {
    console.log('applyFilter()')
    let route = ''
    if (!this.router.url.startsWith('/products')) {
      route = '/products'
    } else {
      route = decodeURIComponent(this.router.url.split('?')[0])
    }

    this.router.navigate([route], {
      queryParams: {
        page: this._page || 0 > 0 ? this._page : undefined,
        query: this._query,
        favorites: this._favorites,
        promo: this._promo,
        new: this._new,
        attributes: this._attributes,
        productId: this._productId,
        itemNum: this._itemNum,
        salUnit: this._salUnit,
        set: this._set,
        department: this._department
      }
    })

    this.removeAltributes()

    this._refreshSub.next(true)
    this._refreshMenuSub.next(true)
  }

  reset() {
    this._page = undefined
    this._query = undefined
    this._favorites = undefined
    this._promo = undefined
    this._new = undefined
    this._categoryId = undefined
    this._attributes = []
    this._department = undefined
    this.applyFilter()
  }

  removeSet() {
    this._set = undefined
  }

  get CategoryIdSub(): Observable<number> {
    return this._catSub.asObservable().pipe(shareReplay())
  }

  get Refresh(): Observable<boolean> {
    return this._refreshSub.asObservable().pipe(shareReplay())
  }

  get RefreshMenu(): Observable<boolean> {
    return this._refreshMenuSub.asObservable().pipe(shareReplay())
  }

  get CategoryId(): number | undefined {
    return this._categoryId
  }

  set CategoryId(value: number | undefined) {
    if (!value || isNaN(value)) {
      value = 0
    } else if (this._categoryId !== value) {
      this._categoryId = value
      if (this._catSub !== undefined) {
        this._catSub.next(value)
      }
    }
  }

  get Page(): number {
    return this._page || 0
  }

  set Page(value: number) {
    if (this._page !== value) {
      this._page = value
      this.applyFilter()
    }
  }

  get Query(): string | undefined {
    return this._query
  }

  set Query(value: string | undefined) {
    if (value) {
      this._query = value
    } else {
      this._query = undefined
    }
    this._page = undefined
  }

  get Favorite(): boolean {
    return this._favorites || false
  }

  set Favorite(value: boolean) {
    this._favorites = value ? value : undefined
    this._page = undefined
    this.applyFilter()
  }

  get Promo(): boolean {
    return this._promo || false
  }

  set Promo(value: boolean) {
    this._promo = value ? value : undefined
    this._page = undefined
    this.applyFilter()
  }

  get New(): boolean {
    return this._new || false
  }

  set New(value: boolean) {
    this._new = value ? value : undefined
    this._page = undefined
    this.applyFilter()
  }

  get Department(): number | undefined {
    return this._department
  }

  set Department(value: number | undefined) {
    this._department = value
    this._page = undefined
    this.applyFilter()
  }

  get Attributes(): number[] {
    return this._attributes
  }

  set Attributes(value: number[]) {
    this._attributes = value
    this._page = undefined
    this.applyFilter()
  }

  get any(): boolean {
    // tslint:disable-next-line: max-line-length
    return this._favorites === true || this._promo === true || this._new === true || (this._department && this._department > 0) || this._set !== undefined
  }

  get Current(): any {
    return {
      index: this._page,
      filterFavorites: this._favorites,
      filterPromo: this._promo,
      filterNew: this._new,
      filterQuery: this._query,
      queryCulture: this.currentLanguage,
      filterDepartment: this._department,
      filterAttributes: this._attributes,
      set: this._set,

      categoryId: this._categoryId
    }
  }

  calculatePages(items: number) {
    let pages = Math.ceil(items / this._items)
    if (pages === 0) {
      pages = 1
    }
    this._pageCount = pages
  }

  removeAltributes() {
    this._productId = undefined
    this._itemNum = undefined
    this._salUnit = undefined
  }

  firstPage() {
    this.setPage()
  }

  previousPage() {
    if (this._page && this._page > 0) {
      this._page--
      this.applyFilter()
    }
  }

  nextPage() {
    if (this._page && this._page < this._pageCount - 1) {
      this._page++
      this.applyFilter()
    } else if (!this._page) {
      this._page = 1
      this.applyFilter()
    }
  }

  lastPage() {
    this.setPage(this._pageCount - 1)
  }

  setPage(page?: number) {
    this._page = (page || 0 > 0) ? page : undefined
    this.applyFilter()
  }

  currentFilters(): ProductFilter {
    return {
      Page: this._page,
      Query: this._query,
      Favorites: this._favorites,
      Promo: this._promo,
      New: this._new,
      Attributes: this._attributes,
      Department: this._department,
      Set: this._set
    }
  }

  get ux(): string | undefined {
    return this._ux
  }

  get set(): string | undefined {
    return this._set
  }

  get enabled(): boolean {
    return this.set === null || this.set === undefined
  }

  get currentLanguage(): string {
    if (this.translate.currentLang) {
      return this.translate.currentLang.split('-')[0]
    }
    return 'nl'
  }
}

export interface ProductFilter {
  Page?: number
  Query?: string
  Favorites?: boolean
  Promo?: boolean
  New?: boolean
  Attributes?: number[]
  Department?: number
  Set?: string
}
