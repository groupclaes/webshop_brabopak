import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { MetaService } from 'src/app/@shared/services/meta.service'
import { AuthService } from 'src/app/auth/auth.service'
import { PcmApiService } from 'src/app/core/api/pcm-api.service'
import { IProduct, ProductsApiService } from 'src/app/core/api/products-api.service'
import { IBreadcrumb } from 'src/app/core/components/breadcrumbs/breadcrumbs.component'
import { environment } from 'src/environments/environment'

import * as capitalize from 'capitalize'

@Component({
  selector: 'bra-product-page',
  templateUrl: './product-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class ProductPageComponent implements OnDestroy {
  private _subs: Subscription[] = []
  private _product: IProduct | undefined
  private _images: any[] | undefined
  private _attachments: any[] | undefined

  private _active_image: number = 0

  private _id: number | undefined

  breadcrumbs: IBreadcrumb[] = [{ name: 'Producten' }]

  availableLimit: Date = new Date(2050, 11, 31)
  error: boolean = false
  loading: boolean = true

  description_touched: boolean = false

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private api: ProductsApiService,
    private pcm: PcmApiService,
    public auth: AuthService,
    private router: Router,
    private localize: LocalizeRouterService,
    private modalCtrl: ModalsService,
    private metaService: MetaService
  ) {
    this._subs.push(this.route.params.subscribe(params => {
      if (params['id'] && params['name']) {
        this._id = +params['id']
        // const name = params['name'].replace(/---/g, ' - ').replace(/-/g, ' ')
        this.load(this._id)
      }
    }))

    this._subs.push(this.auth.customerChange.subscribe(() => {
      if (this._id)
        this.load(this._id)
    }))

    this._subs.push(this.auth.change.subscribe(() => {
      if (this._id)
        this.loadResources()
    }))
  }

  ngOnDestroy(): void {
    console.debug('ProductsPageComponent.ngOnDestroy()')
    if (this._subs)
      this._subs.forEach(s => s.unsubscribe())
  }

  async load(id: number) {
    if (id <= 0) {
      this.loading = false
      this.error = true
      this.ref.markForCheck()
      return
    }
    this._product = undefined
    this.loading = true
    this.ref.markForCheck()

    try {
      const response = await this.api.get({
        id,
        token: this.auth.id_token?.token,
        usercode: this.auth.currentCustomer?.usercode,
        culture: this.culture.split('-')[0]
      })

      this._product = response.data.product
      this.breadcrumbs = [{ name: 'Producten' }]
      this.breadcrumbs = this.breadcrumbs.concat(this._product.breadcrumbs.map((e: any) => ({ name: this.capitalize(e.name), id: e.id })))
      this.breadcrumbs.push({ name: this._product.name, product_id: id })
      // this._product.features = [
      //   "Haal meer uit elk servet: deze papierservetten voor eenmalig gebruik zijn groter als ze uitgevouwen zijn.",
      //   "Verbeter de hygiëne: dankzij de volledig gesloten servetdispenser raken gasten alleen de servetten aan die ze gebruiken.",
      //   "Bespaar tijd en ruimte én verbeter de hygiëne met onze unieke verpakkingsoplossing voor servetvullingen.",
      //   "Verminder verspilling van dinerservetten: één - per - keer - dosering helpt u verbruik en kosten te controleren.",
      //   "Leveringsomvang: 8 bundels à 1125 servetten, 1-laags, Universal- kwaliteit.Geschikt voor Tork N4- servettendispensers."
      // ]


      this.metaService.apply(this._product.name, this._product.name) // , tranlsations[keywords], tranlsations[image]

      this.loadResources()
      this.error = false
    } catch (err) {
      this.error = true
      console.log('Error loading product data', err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  async loadResources() {
    if (!this._product) return
    try {
      const requests = Promise.all([this.pcm.getProductImagesList(this._product.itemnum, this.culture.split('-')[0]), this.pcm.getObjectList(this._product.itemnum)])
      const resources = await requests
      this._images = resources[0].data

      if (resources[1].data) {
        this._attachments = resources[1].data.filter((e: any) => e.documentType !== 'display-image')
        if (!this._attachments) this._attachments = []
        // if not agent
        if (!this.auth.isAgent())
          if (!this._product.favorite || !this._product.favorite[0].last_bought_date)
            this._attachments = this._attachments.filter(e => e.documentType !== 'datasheet' && e.documentType !== 'technische-fiche')
      }
      this._active_image = 0
    } catch (err) {
      console.log('Error loading product data', err)
    } finally {
      this.ref.markForCheck()
    }
  }

  async toggleFavorite() {
    if (!this._product) return

    let mode = 1
    if (this._product.favorite && this._product.favorite[0].is_favorite) {
      if (this._product.favorite[0].is_favorite) mode = 0
    }

    let update = false

    if (mode === 0) {
      const modal = new Modal('alert', 'Product verwijderen?', 'Ben je zeker dat je dit product uit je favorieten wilt verwijderen?', [{ title: 'Verwijderen', action: () => true, color: 'danger' }, { title: 'Annuleer', type: 'abort' }])
      update = await this.modalCtrl.show(modal)
    } else {
      const modal = new Modal('success', 'Product toevoegen?', 'Ben je zeker dat je dit product wilt toevoegen aan je favorieten?', [{ title: 'Toevoegen', action: () => true, color: 'success' }, { title: 'Annuleer', type: 'abort' }])
      update = await this.modalCtrl.show(modal)
    }

    if (update) {
      if (this._product.favorite)
        this._product.favorite[0].is_favorite = !this._product.favorite[0].is_favorite
      else
        this._product.favorite = [{ is_favorite: true }]

      await this.api.putFavorite({ id: this._product.id, usercode: this.auth.currentCustomer?.usercode, mode })
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

  capitalize(text: string) {
    return capitalize.words(text, {
      skipWord: /^(en|de|het|et|a|pour|voor|om|van)$/
    })
  }

  goto(breadcrumb: any) {
    if (!breadcrumb.id && !breadcrumb.product_id) {
      this.router.navigate([this.localize.translateRoute('/products')])
      return
    }

    if (breadcrumb.product_id) {
      this.router.navigate([this.localize.translateRoute('/product'), breadcrumb.product_id, breadcrumb.name.replace(/ /g, '-').toLowerCase()])
      return
    }

    if (breadcrumb.id) {
      const breadcrumb_index = this.breadcrumbs.findIndex(b => b.id === breadcrumb.id)
      console.log(breadcrumb_index)
      const names = []
      for (let i = 1; i <= breadcrumb_index; i++) {
        names.push(this.breadcrumbs[i].name.replace(/ /g, '-').toLowerCase())
      }
      this.router.navigate([this.localize.translateRoute('/products'), ...names], { queryParams: { id: breadcrumb.id } })
      return
    }


    this.router.navigate([this.localize.translateRoute('/')])
  }

  enableSave(): void {
    this.description_touched = true
    this.ref.markForCheck()
  }

  async updateDescription() {
    if (!this._product || !this.auth.currentCustomer) return
    let modal: Modal

    if (this._product.customer_description && this._product.customer_description?.trim().length > 0) {
      modal = new Modal('success', 'Mijn omschrijving wijzigen?', 'Ben je zeker dat je je omschrijving wilt wijzigen?', [{ title: 'Opslaan', action: () => true, color: 'success' }, { title: 'Annuleer', type: 'abort' }])
    } else {
      modal = new Modal('alert', 'Mijn omschrijving verwijderen?', 'Ben je zeker dat je je omschrijving wilt verwijderen?', [{ title: 'Verwijderen', action: () => true, color: 'danger' }, { title: 'Annuleer', type: 'abort' }])
    }

    if (await this.modalCtrl.show(modal)) {
      if (this._product.customer_description && this._product.customer_description?.trim().length > 0) {
        await this.api.putDescription({ id: this._product.id, usercode: this.auth.currentCustomer.usercode, description: this._product.customer_description.trim() })
      } else {
        await this.api.deleteDescription({ id: this._product.id, usercode: this.auth.currentCustomer.usercode })
      }

      this.description_touched = false
      this.ref.markForCheck()
    }
  }

  get featuresExpanded(): boolean {
    return true
  }

  get isFood(): boolean {
    if (this._product) {
      if (this._product.itemnum) {
        const itemnum = parseInt(this._product.itemnum.toString().substring(0, 3), 10)
        if (itemnum <= 136) {
          return true
        }
      }
    }
    return false
  }

  get isFavorite(): boolean {
    return this.auth.isAuthenticated() && this._product?.favorite && (this._product.favorite[0].is_favorite === true || this._product.favorite[0].is_favorite === null) || false
  }

  get product(): IProduct | undefined {
    return this._product
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

  get pcmUrl(): string {
    return environment.pcm
  }
}
