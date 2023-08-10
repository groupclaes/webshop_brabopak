import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { AuthService } from '../auth.service'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'

@Component({
  selector: 'bra-reset-password',
  templateUrl: './reset-password-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent {
  isLoading = false

  resetPasswordForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    reset_token: ['', [Validators.required]]
  })

  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private modalCtrl: ModalsService,
    private router: Router,
    private localize: LocalizeRouterService
  ) {
    firstValueFrom(route.queryParams).then(params => {
      if (params['login_hint'])
        this.resetPasswordForm.controls['username'].setValue(params['login_hint'])
      if (params['reset_token'])
        this.resetPasswordForm.controls['reset_token'].setValue(params['reset_token'])
    })
  }

  async submit() {
    if (!this.resetPasswordForm.valid) return

    try {
      const response = await this.auth.resetPassword(this.resetPasswordForm.value)
      if (response.data?.success) {
        const modal = new Modal('success', 'Wachtwoord opgeslagen', 'Je kan nu met je nieuwe wachtwoord inloggen.')
        await this.modalCtrl.show(modal)

        this.router.navigate([this.localize.translateRoute('/auth/sign-in')], { queryParams: { login_hint: this.currentUsername } })
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
    const { username } = this.resetPasswordForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
