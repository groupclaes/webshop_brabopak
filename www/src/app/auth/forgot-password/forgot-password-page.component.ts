import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { TranslateService } from '@ngx-translate/core'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { firstValueFrom } from 'rxjs'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { AuthService } from '../auth.service'

@Component({
  selector: 'bra-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPageComponent {
  isLoading = false

  forgotPasswordForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]]
  })

  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private modalCtrl: ModalsService
  ) {
    firstValueFrom(route.queryParams).then(params => {
      if (params['login_hint'])
        this.forgotPasswordForm.controls['username'].setValue(params['login_hint'])
    })
  }

  async submit() {
    if (!this.forgotPasswordForm.valid) return

    try {
      const response = await this.auth.resetPassword(this.forgotPasswordForm.value)
      console.log(response)
      if (response.data?.success) {
        const modal = new Modal('success', 'Email verstuurd', 'Je ontvangt binnenkort een mailtje met een link om je wachtwoord opnieuw in te stellen, vergeet zeker je SPAM box niet te bekijken.')
        this.modalCtrl.show(modal)
      }
    } catch (err: any) {
      switch (err?.status) {
        case 500:
          const modal = new Modal('alert', 'Serverfout', 'Er is een fout opgetreden tijdens het behandelen van je verzoekm probeer later opnieuw.')
          this.modalCtrl.show(modal)
          break
      }
    }
  }

  get currentUsername(): string | undefined {
    const { username } = this.forgotPasswordForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
