import { Component } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'bra-mobile-navigation',
  templateUrl: './mobile-navigation.component.html',
  styles: [
  ]
})
export class MobileNavigationComponent {
  constructor(private auth: AuthService) { }

  get canViewPromo(): boolean | undefined {
    return this.auth.currentCustomer?.promo
  }
}
