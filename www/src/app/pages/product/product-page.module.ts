import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProductPageComponent } from './product-page.component'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from 'src/app/core/components/components.module'
import { NgBytesPipeModule } from 'angular-pipes'
import { TranslateModule } from '@ngx-translate/core'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'

@NgModule({
  declarations: [
    ProductPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    TranslateModule.forChild(),
    NgBytesPipeModule,
    LocalizeRouterModule,
    RouterModule.forChild([{
      path: '',
      component: ProductPageComponent
    }])
  ]
})
export class ProductPageModule { }
