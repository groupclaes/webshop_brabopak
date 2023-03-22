import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomePageComponent } from './home-page.component'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductsModule } from 'src/app/core/components/products/products.module'

@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    CommonModule,
    ProductsModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: HomePageComponent
    }])
  ]
})
export class HomePageModule { }
