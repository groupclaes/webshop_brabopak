import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { AuthService } from 'src/app/auth/auth.service'
import { LayoutService } from '../../layout.service'

@Component({
  selector: 'claes-account',
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative py-3'
  }
})
export class AccountComponent {
  expanded: boolean = false
  timeout: number | undefined

  @HostListener('mouseleave', ['$event'])
  mouseLeave(event: MouseEvent) {
    this.timeout = window.setTimeout(() => {
      this.expanded = false
      this.ref.markForCheck()
    }, 180)

    event.preventDefault()
  }

  @HostListener('mouseenter', ['$event'])
  mouseenter(event: MouseEvent) {
    window.clearTimeout(this.timeout)
    event.preventDefault()
  }

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

  toggle(): void {
    this.expanded = !this.expanded
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
