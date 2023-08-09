import { Injectable } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private _content: string | undefined

  constructor(auth: AuthService) {
    const update = () => {
      console.debug('BannerService()', auth.currentCustomer)
      if (auth.currentCustomer?.address_id && auth.currentCustomer?.address_id > 0)
        this._content = `Huidige klant: ${auth.currentCustomer?.id} ${auth.currentCustomer?.name} - ${auth.currentCustomer?.address_id} ${auth.currentCustomer?.address_name} - ${auth.currentCustomer?.address_city}`
      else
        this._content = `Huidige klant: ${auth.currentCustomer?.id} ${auth.currentCustomer?.name} - ${auth.currentCustomer?.city}`
    }

    auth.customerChange.subscribe({
      next: () => {
        if (auth.isMultiUser() && auth.currentCustomer) {
          update()
          return
        }

        this._content = undefined
      }
    })

    auth.change.subscribe({
      next: (token) => {
        if (!token) this._content = undefined
      }
    })

    if (auth.currentCustomer) {
      if (auth.isMultiUser()) {
        update()
        return
      }
    }

    this._content = undefined
  }

  get content(): string {
    return this._content ?? 'Gratis levering bij een bestelling boven &euro; 150'
  }
}
