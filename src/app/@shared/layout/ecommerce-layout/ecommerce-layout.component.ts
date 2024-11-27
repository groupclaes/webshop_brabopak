import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'claes-ecommerce-layout',
  templateUrl: './ecommerce-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex flex-auto w-full' }
})
export class EcommerceLayoutComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private ref: ChangeDetectorRef
  ) {
    this.auth.change.subscribe({
      next: () => { this.ref.markForCheck() }
    })
  }

  ngOnInit(): void {
  }

  logout() {
    this.auth.logout()
  }

  get authenticated(): boolean {
    return this.auth.isAuthenticated()
  }
}
