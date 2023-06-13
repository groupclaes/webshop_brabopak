import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomePageComponent } from './home-page.component'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductsModule } from 'src/app/core/components/products/products.module'
import { PipesModule } from 'src/app/core/pipes/pipes.module'
import { CoreComponentsModule } from 'src/app/core/components/components.module'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'

@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    ProductsModule,
    PipesModule,
    LocalizeRouterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: HomePageComponent
    }])
  ]
})
export class HomePageModule { }
