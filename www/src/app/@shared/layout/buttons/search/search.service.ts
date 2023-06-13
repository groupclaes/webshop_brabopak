import { EventEmitter, Injectable } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { TranslateService } from '@ngx-translate/core'
import { Observable, filter, shareReplay } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _items = 16

  private _page: number | undefined = 0
  private _query: string | undefined = ''
  private _only_favorites?: boolean = false
  private _only_promo?: boolean = false
  private _only_new?: boolean = false
  private _only_best_selling?: boolean = false
  private _only_spotlight?: boolean = false
  private _only_recent?: boolean = false
  private _category_id: number | undefined
  private _page_count: number | undefined
  private _itemNum: string | undefined
  private _salUnit: string | undefined
  // private _collection: string | undefined

  private _catSub = new EventEmitter<number>()
  private _refreshSub = new EventEmitter<boolean>()
  private _refreshMenuSub = new EventEmitter<boolean>()

  constructor(
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private localize: LocalizeRouterService
  ) {
    this.route.queryParams.subscribe(params => {
      let filters: any = {}
      if (params['id']) {
        filters.category_id = +params['id']
      }

      if (params['only_promo'] === 'true') {
        console.debug('we need promo products')
        filters.only_promo = true
      }

      if (params['only_new'] === 'true') {
        console.debug('we need new products')
        filters.only_new = true
      }

      if (params['only_favorites'] === 'true') {
        console.debug('we need favorites products')
        filters.only_favorites = true
      }

      if (params['only_best_selling'] === 'true') {
        console.debug('we need best selling products')
        filters.only_best_selling = true
      }

      if (params['only_spotlight'] === 'true') {
        console.debug('we need spotlight products')
        filters.only_spotlight = true
      }

      if (params['only_recent'] === 'true') {
        console.debug('we need recent products')
        filters.only_recent = true
      }

      if (params['page']) {
        filters.page = +params['page']
      }

      if (params['query']) {
        filters.query = params['query']
      }

      if (params['itemNum']) {
        filters.itemNum = params['itemNum']
      }

      if (params['salUnit']) {
        filters.salUnit = params['salUnit']
      }

      if (
        (filters.page && filters.page === this._page) &&
        (filters.query && filters.query === this._query) &&
        (filters.category_id && filters.category_id === this._category_id) &&
        (filters.only_favorites && filters.only_favorites === this._only_favorites) &&
        (filters.only_promo && filters.only_promo === this._only_promo) &&
        (filters.only_new && filters.only_new === this._only_new) &&
        (filters.only_spotlight && filters.only_spotlight === this._only_spotlight) &&
        (filters.only_best_selling && filters.only_best_selling === this._only_best_selling) &&
        (filters.only_recent && filters.only_recent === this._only_recent)
      ) {
        // console.debug('filters have not changed, ignore update request')
      } else {
        this._page = filters.page
        this._query = filters.query
        this._category_id = filters.category_id
        this._only_favorites = filters.only_favorites
        this._only_promo = filters.only_promo
        this._only_new = filters.only_new
        this._only_spotlight = filters.only_spotlight
        this._only_best_selling = filters.only_best_selling
        this._only_recent = filters.only_recent

        this._itemNum = filters.itemNum
        this._salUnit = filters.salUnit

        this._refreshSub.next(true)
        this._refreshMenuSub.next(true)
      }
    })

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(r => {
      const ev = r as { url: string }
      if (!ev.url.startsWith('/products')) {
        this.category_id = undefined
      }
    })
  }

  reset(): void {
    this._page = undefined
    this._query = undefined
    this._only_favorites = undefined
    this._only_promo = undefined
    this._only_new = undefined
    this._category_id = undefined
    this.apply()
  }

  apply(): void {
    const current = this.current
    delete current.culture

    let url: any[] = []
    if (!window.location.pathname.includes('/products'))
      url = (this.localize.translateRoute(['/products']) as any[])

    this.router.navigate(url, {
      queryParams: {
        ...current,
        itemNum: this._itemNum,
        salUnit: this._salUnit
      },
      replaceUrl: true,
      queryParamsHandling: 'merge'
    })

    this.removeAltributes()

    this._refreshSub.next(true)
    this._refreshMenuSub.next(true)
  }

  calculatePages(items: number) {
    let pages = Math.ceil(items / this._items)
    if (pages === 0) {
      pages = 1
    }
    this._page_count = pages
  }

  removeAltributes() {
    this._itemNum = undefined
    this._salUnit = undefined
  }

  firstPage() {
    this.setPage(undefined)
  }

  previousPage() {
    if (this._page && this._page > 0) {
      this._page--
      this.apply()
    }
  }

  nextPage() {
    if (this._page && (this._page < (this._page_count ?? 1) - 1)) {
      this._page++
      this.apply()
    } else if (!this._page) {
      this._page = 1
      this.apply()
    }
  }

  lastPage() {
    this.setPage((this._page_count ?? 1) - 1)
  }

  setPage(page: number | undefined) {
    this._page = (page && page > 0) ? page : undefined
    this.apply()
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

  get id(): number | undefined {
    return this._category_id
  }

  set category_id(value: number | undefined) {
    if (!value || isNaN(value)) {
      value = 0
    } else if (this._category_id !== value) {
      this._category_id = value
      if (this._catSub !== undefined) {
        this._catSub.next(value)
      }
    }
  }

  get items(): number {
    return this._items
  }

  get page(): number | undefined {
    return this._page
  }

  set page(value: number | undefined) {
    if (this._page !== value) {
      this._page = value
      this.apply()
    }
  }

  get page_count(): number {
    return this._page_count ?? 0
  }

  get query(): string | undefined {
    return this._query
  }

  set query(value: string | undefined) {
    this._query = value
    this._page = undefined
    this.apply()
  }

  get only_favorites(): boolean | undefined {
    return this._only_favorites
  }

  set only_favorites(value: boolean | undefined) {
    this._only_favorites = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get only_promo(): boolean | undefined {
    return this._only_promo
  }

  set only_promo(value: boolean | undefined) {
    this._only_promo = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get only_new(): boolean | undefined {
    return this._only_new
  }

  set only_new(value: boolean | undefined) {
    this._only_new = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get only_best_selling(): boolean | undefined {
    return this._only_best_selling
  }

  set only_best_selling(value: boolean | undefined) {
    this._only_best_selling = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get only_spotlight(): boolean | undefined {
    return this._only_spotlight
  }

  set only_spotlight(value: boolean | undefined) {
    this._only_spotlight = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get only_recent(): boolean | undefined {
    return this._only_recent
  }

  set only_recent(value: boolean | undefined) {
    this._only_recent = value ? value : undefined
    this._page = undefined
    this.apply()
  }

  get any(): boolean {
    // tslint:disable-next-line: max-line-length
    return this._only_favorites === true || this._only_promo === true || this._only_new === true || this._only_spotlight === true || this._only_best_selling === true || this._only_recent === true
  }

  get hasPrevious(): boolean {
    return (this._page ?? 0) > 0
  }

  get hasNext(): boolean {
    return (this._page ?? 0) < this.page_count - 1
  }

  get current(): any {
    return {
      category_id: this._category_id,
      page: this._page,
      only_favorites: this._only_favorites,
      only_promo: this._only_promo,
      only_new: this._only_new,
      only_best_selling: this._only_best_selling,
      only_spotlight: this._only_spotlight,
      only_recent: this._only_recent,
      query: this._query,
      culture: this.culture
    }
  }

  get culture(): string {
    return (environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) || environment.defaultLanguage).split('-')[0]
  }
}
