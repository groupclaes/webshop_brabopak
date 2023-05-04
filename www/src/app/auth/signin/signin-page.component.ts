import { HttpErrorResponse } from '@angular/common/http'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { firstValueFrom } from 'rxjs'
import { AuthService } from '../auth.service'

@Component({
  selector: 'bra-signin-page',
  templateUrl: './signin-page.component.html',
  styles: [
  ]
})
export class SigninPageComponent implements OnInit {
  mfaRequired = false
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
    private route: ActivatedRoute,
    private recaptchaV3Service: ReCaptchaV3Service
  ) { }

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

  async signin() {
    if (!this.signinForm.valid)
      return

    await this.loginSso()
  }

  async loginSso() {
    const token = await firstValueFrom(this.recaptchaV3Service.execute('login'))

    try {
      const authorizeResponse: IAuthorizeResponse = await this.auth.authorize(this.signinForm.value, token)

      let authorization_code = authorizeResponse.authorization_code

      if (authorizeResponse.mfa_required) {
        this.enableMfa()
        return
      }

      if (!authorization_code) return

      await this.auth.getToken(authorization_code).toPromise()
      if (this.hasError(authorizeResponse)) {
        this.handleError(authorizeResponse)
      } else {
        this.goToDashboard()
      }
    } catch (err: any) {
      console.log(err)
      if (err.status && err.message) {
        const errRes = (err as HttpErrorResponse)

        switch (errRes.status) {
          case 0:
            alert(errRes.statusText)
            break

          case 404:
            if (errRes.error.error === 'Username or password is incorrect!') {
              alert(this.translate.instant('errors.incorrect_credentials'))
            }
            break

          case 429:
            alert(errRes.error.reason)
            break

          default:
            alert(errRes.error.reason)
            break
        }
      }
    } finally {
      this.ref.markForCheck()
    }
  }

  hasError(authorizeResponse: IAuthorizeResponse) {
    return authorizeResponse.errors.length > 0
  }

  handleError(authorizeResponse: IAuthorizeResponse) {
    const error = authorizeResponse.errors.find(err => err.error === 'PasswordPolicy')
    if (error) {
      // if (confirm(this.translate.instant(`errors.PasswordPolicy-${error.error_code}`, { length: error.args?.length }))) {
      //   this.router.navigate(['/account/password-change'])
      //   return
      // }
    }
    this.goToDashboard()
  }

  goToDashboard() {
    this.router.navigate(['/home'])
  }

  private enableMfa() {
    this.mfaRequired = true
    this.signinForm.addControl('mfa_code', this.fb.control('', Validators.required))
  }

  get currentUsername(): string | undefined {
    const { username } = this.signinForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}

export interface IAuthorizeResponse {
  authorization_code?: string
  mfa_required?: boolean
  errors: IAuthorizeError[]
}

export interface IAuthorizeError {
  error: 'PasswordPolicy' | 'Unknown'
  error_code: number
  message: string
  args: any
}