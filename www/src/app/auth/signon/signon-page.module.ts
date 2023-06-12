import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SignonPageComponent } from './signon-page.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { ModalsModule } from 'src/app/core/components/modals/modals.module'

@NgModule({
  declarations: [
    SignonPageComponent
  ],
  imports: [
    CommonModule,
    ModalsModule,
    ReactiveFormsModule,
    LocalizeRouterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: SignonPageComponent
    }])
  ]
})
export class SignonPageModule { }
