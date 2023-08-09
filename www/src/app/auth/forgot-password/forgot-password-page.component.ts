import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { TranslateService } from '@ngx-translate/core'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { Subscription } from 'rxjs'
import { ModalsService } from 'src/app/@shared/modals/modals.service'
import { AuthService } from '../auth.service'

@Component({
  selector: 'bra-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPageComponent implements OnInit, OnDestroy {
  isLoading = false

  forgotPasswordForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]]
  })

  subs: Subscription[] = []

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private localize: LocalizeRouterService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private modalCtrl: ModalsService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // throw new Error('Method not implemented.')
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.')
  }

  async submit() {
    if (!this.forgotPasswordForm.valid) return

  }

  get currentUsername(): string | undefined {
    const { username } = this.forgotPasswordForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
