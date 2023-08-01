import { Component } from '@angular/core'
import { BannerService } from './banner.service'

@Component({
  selector: 'bra-banner',
  templateUrl: './banner.component.html',
  host: {
    class: 'flex h-10 items-center justify-center bg-primary px-4 text-sm font-medium text-white sm:px-6 lg:px-8'
  }
})
export class BannerComponent {
  constructor (public service: BannerService) {}
}
