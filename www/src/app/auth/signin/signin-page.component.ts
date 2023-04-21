import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from '../auth.service'

@Component({
  selector: 'bra-signin-page',
  templateUrl: './signin-page.component.html',
  styles: [
  ]
})
export class SigninPageComponent implements OnInit {
  isLoading = false
  signinForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true, [Validators.required]]
  })

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(q => {
      const { action, username, email, regcode } = q
      if (action) {
        if (action === 'signon') {
          this.router.navigate(['/register'], {
            queryParams: {
              username: email,
              code: regcode
            }
          })
        } else if (action === 'signup') {
          this.router.navigate(['/new-customer'])
        } else {
          this.router.navigate(['/login'], { queryParams: { username } })
        }
      }
      if (username) {
        this.signinForm.controls['username'].setValue(username)
      }
    })

    this.auth.change.subscribe((auth) => {
      if (auth && this.auth.id_token?.usertype === 1) {
        console.info(`user is now authenticated, go to home page.`)
        this.router.navigate(['/home'])
      } else if (auth) {
        console.info(`user is now authenticated, go to customers page.`)
        this.router.navigate(['/customers'])
      }
    })

    if (this.auth.isAuthenticated() && this.auth.id_token && this.auth.id_token.usercode !== 0) {
      if (this.auth.id_token.usertype === 1) {
        // console.info(`user is logged in and authenticated, go to home page.`)
        // this.router.navigate(['/home'])
      } else if (this.auth.id_token.usertype > 1 && this.auth.id_token.usertype < 5) {
        // console.info(`user is logged in and authenticated, go to customers page.`)
        // this.router.navigate(['/customers'])
      }
    }
  }

  signin() {
    if (!this.signinForm.valid) return

    this.isLoading = true
    this.ref.markForCheck()

    // this.auth.login(this.loginForm.value).pipe(finalize(() => {
    //   this.loginForm.markAsPristine()
    //   console.debug('loginForm.markAsPristine()')
    // })).subscribe((token: any) => {
    //   if (token) {
    //     console.debug(`successfully logged in`)
    //   }
    //   this.isLoading = false
    //   this.ref.markForCheck()
    // }, (error: any) => {
    //   console.debug(`Login error: ${error}`)
    //   switch (error.status) {
    //     case 401:
    //       console.warn('wrongCredentials')
    //       alert(this.translate.instant('wrongCredentials'))
    //       break

    //     case 404:
    //       console.warn('accountNotFound')
    //       alert(this.translate.instant('accountNotFound'))
    //       break

    //     default:
    //       console.warn('unknownServerError')
    //       alert(this.translate.instant('unknownServerError'))
    //       break
    //   }
    //   this.isLoading = false
    //   this.ref.markForCheck()
    // })
  }

  get currentUsername(): string | undefined {
    const { username } = this.signinForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
