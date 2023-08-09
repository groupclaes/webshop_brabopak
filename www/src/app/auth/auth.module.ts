import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      children: [
        {
          path: 'sign-in',
          loadChildren: () => import('./signin/signin-page.module').then(m => m.SigninPageModule)
        },
        {
          path: 'sign-on',
          loadChildren: () => import('./signon/signon-page.module').then(m => m.SignonPageModule)
        },
        {
          path: 'sign-up',
          loadChildren: () => import('./signup/signup-page.module').then(m => m.SignupPageModule)
        },
        {
          path: 'reset-password',
          loadChildren: () => import('./reset-password/reset-password-page.module').then(m => m.ResetPasswordPageModule)
        },
        {
          path: 'forgot-password',
          loadChildren: () => import('./forgot-password/forgot-password-page.module').then(m => m.ForgotPasswordPageModule)
        }
      ]
    }])
  ]
})
export class AuthModule { }
