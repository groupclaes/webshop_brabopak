import { Injectable } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private _content: string | undefined

  constructor(auth: AuthService) {
    const update = () => {
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
    return this._content ?? (
      new Date().getTime() > new Date(2024, 11, 1).getTime() ? 'Jouw partner in verpakking, <a href="//pcm.groupclaes.be/v4/content/bra/website/leaflet/20241106" target="_blank" rel="nofollow noopener" class="text-accent hover:underline">Opgelet! Aangepaste openingsuren tijdens eindejaar</a>' : 'Jouw partner in verpakking'
    )
  }
}
