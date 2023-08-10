import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { CartService } from 'src/app/@shared/layout/buttons/cart/cart.service'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service'

@Component({
  selector: 'bra-home-page',
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class HomePageComponent implements OnDestroy {
  private _subs: Subscription[] = []
  dashboard: any[] = []
  loading: boolean = true

  constructor(
    public auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    private cart: CartService
  ) {
    this._subs.push(this.auth.change.subscribe({
      next: (token) => {
        if (this.auth.isAuthenticated())
          this.load()
        if (!token)
          location.reload()
      }
    }))
    this._subs.push(
      this.auth.customerChange.subscribe({
        next: () => {
          this.ref.markForCheck()
        }
      })
    )
    if (this.auth.isAuthenticated())
      this.load()
  }

  ngOnDestroy(): void {
    console.debug('ProductsPageComponent.ngOnDestroy()')
    if (this._subs)
      this._subs.forEach(s => s.unsubscribe())
  }

  async load() {
    try {
      this.loading = true
      this.ref.markForCheck()

      if (this.auth.id_token) {
        const resp = await this.api.dashboard(this.auth.id_token?.usercode)
        this.dashboard = resp.data.blocks
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  get name(): string | undefined {
    return this.auth.id_token?.given_name
  }

  get abandonedCart(): { count: number } | undefined {
    if (this.cart.productCount > 0 && this.cart.modified)
      if (new Date(this.cart.modified).getTime() < new Date().getTime() - 86400000)
        return {
          count: this.cart.productCount
        }
    return undefined
  }
}
