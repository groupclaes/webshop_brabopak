import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
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

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef
  ) {
    this.auth.change.subscribe({
      next: (token) => {
        console.log(token)
      }
    })
    this.load()
  }

  async load() {
    const resp = await this.api.dashboard()

    this.dashboard = resp
    this.ref.markForCheck()
    console.log(resp)
  }

  get name(): string | undefined {
    return this.auth.id_token?.given_name
  }

  get abandonedCart(): { count: number } | undefined {
    return {
      count: 4
    }
  }
}
