import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ResetPasswordPageComponent } from './reset-password-page.component'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha'
import { ModalsModule } from 'src/app/@shared/modals/modals.module'
import { environment } from 'src/environments/environment'

@NgModule({
  declarations: [
    ResetPasswordPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RecaptchaV3Module,
    LocalizeRouterModule,
    ModalsModule,
    RouterModule.forChild([{
      path: '',
      component: ResetPasswordPageComponent
    }])
  ],
  providers: [{
    provide: RECAPTCHA_V3_SITE_KEY,
    useValue: environment.google_recaptcha,
  }]
})
export class ResetPasswordPageModule { }
