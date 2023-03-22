import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'claes-classy-layout',
  templateUrl: './classy-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex flex-auto w-full' }
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
  private $sub: Subscription | undefined

  constructor(
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.$sub = this.auth.change.subscribe(() => {
      this.ref.markForCheck()
    })
  }

  ngOnDestroy() {
    this.$sub?.unsubscribe()
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
}
