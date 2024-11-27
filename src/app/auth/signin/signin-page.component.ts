import { HttpErrorResponse } from '@angular/common/http'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { Subscription, firstValueFrom } from 'rxjs'
import { AuthService } from '../auth.service'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'bra-signin-page',
  templateUrl: './signin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninPageComponent {
  mfaRequired = false
  isLoading = false

  signinForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true, [Validators.required]]
  })

  subs: Subscription[] = []

  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private localize: LocalizeRouterService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private modalCtrl: ModalsService,
    private translate: TranslateService
  ) {
    firstValueFrom(route.queryParams).then(params => {
      if (params['login_hint'])
        this.signinForm.controls['username'].setValue(params['login_hint'])
    })

    firstValueFrom(auth.change).then(res => {
      if (res && auth.id_token)
        this.navigateByUserType(auth.id_token.user_type)
    })

    if (auth.isAuthenticated() && auth.id_token && auth.id_token.usercode !== 0)
      this.navigateByUserType(auth.id_token.user_type)
  }

  navigateByUserType(user_type: number) {
    switch (user_type) {
      case 1:
        this.router.navigate([this.localize.translateRoute('/')])
        break

      case 2:
      case 3:
        this.router.navigate([this.localize.translateRoute('/products')])
        break

      case 4:
        this.router.navigate([this.localize.translateRoute('/products')])
        break
    }
  }

  async signin() {
    if (!this.signinForm.valid)
      return

    await this.loginSso()
  }

  async loginSso() {
    this.isLoading = true
    this.ref.markForCheck()
    const token = await firstValueFrom(this.recaptchaV3Service.execute('login'))

    try {
      const authorizeResponse: IAuthorizeResponse = await this.auth.authorize(this.signinForm.value, token)

      let authorization_code = authorizeResponse.authorization_code

      if (authorizeResponse.mfa_required) {
        this.isLoading = false
        this.ref.markForCheck()
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
              const modal = new Modal('alert', 'Foute inloggegevens', 'Controleer je e-mailadres en wachtwoord en probeer opniew. Je kan een nieuw wachtwoord instellen via \'wachtwoord vergeten ?\'.')
              this.modalCtrl.show(modal)
              this.signinForm.controls['password'].reset()
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
      this.isLoading = false
      this.ref.markForCheck()
    }
  }

  hasError(authorizeResponse: IAuthorizeResponse) {
    return authorizeResponse.errors.length > 0
  }

  handleError(authorizeResponse: IAuthorizeResponse) {
    const error = authorizeResponse.errors.find(err => err.error === 'PasswordPolicy')
    if (error) {
      if (confirm(this.translate.instant(`errors.PasswordPolicy-${error.error_code}`, { length: error.args?.length }))) {
        this.router.navigate(['/account/password-change'])
        return
      }
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