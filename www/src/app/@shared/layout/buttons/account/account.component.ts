import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { AuthService } from 'src/app/auth/auth.service'
import { LayoutService } from '../../layout.service'

@Component({
  selector: 'claes-account',
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {

  constructor(
    private ref: ChangeDetectorRef,
    public auth: AuthService,
    private sanitizer: DomSanitizer,
    private layout: LayoutService
  ) {
    this.auth.change.subscribe(provider => {
      this.ref.markForCheck()
    })
  }

  logout(): void {
    this.auth.logout()
  }

  get multiUser(): boolean {
    return this.authenticated && this.auth.isMultiUser()
  }

  get customers() {
    return this.auth.customers
  }

  get avatar(): SafeResourceUrl | undefined {
    if (this.auth.id_token)
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.auth.id_token?.picture)
    return undefined
  }

  get displayName(): string | undefined {
    return this.auth.id_token?.name
  }

  get email(): string | undefined {
    return this.auth.id_token?.email
  }

  get showAvatar(): boolean {
    return false // !(['futuristic', 'classy'].includes(this.layout.current))
  }

  get authenticated(): boolean {
    return this.auth.isAuthenticated()
  }
}
