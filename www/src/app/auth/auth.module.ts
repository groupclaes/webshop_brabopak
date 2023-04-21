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
        }
      ]
    }])
  ]
})
export class AuthModule { }
