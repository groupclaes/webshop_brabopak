import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha'
import { ModalsModule } from 'src/app/@shared/modals/modals.module'
import { environment } from 'src/environments/environment'
import { ForgotPasswordPageComponent } from './forgot-password-page.component'



@NgModule({
  declarations: [
    ForgotPasswordPageComponent
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
      component: ForgotPasswordPageComponent
    }])
  ],
  providers: [{
    provide: RECAPTCHA_V3_SITE_KEY,
    useValue: environment.google_recaptcha,
  }]
})
export class ForgotPasswordPageModule { }
