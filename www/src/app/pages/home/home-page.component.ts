import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
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
export class HomePageComponent {
  dashboard: any[] = []
  loading: boolean = true

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    private cart: CartService
  ) {
    this.auth.change.subscribe({
      next: (token) => {
        if (this.auth.isAuthenticated())
          this.load()
      }
    })
    if (this.auth.isAuthenticated())
      this.load()
  }

  async load() {
    try {
      this.loading = true
      this.ref.markForCheck()

      console.log(this.auth.id_token)
      const resp = await this.api.dashboard(this.auth.id_token?.usercode)

      this.dashboard = resp
      this.ref.markForCheck()
      console.log(resp)
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
    if (this.cart.productCount > 0)
      return {
        count: this.cart.productCount
      }
    return undefined
  }
}
