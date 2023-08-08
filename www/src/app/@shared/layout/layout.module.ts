import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutComponent } from './layout.component'
import { EcommerceLayoutComponent } from './ecommerce-layout/ecommerce-layout.component'
import { EmptyLayoutComponent } from './empty-layout/empty-layout.component'
import { MatMenuModule } from '@angular/material/menu'
import { TranslateModule } from '@ngx-translate/core'
import { FooterComponent } from './footer/footer.component'
import { SettingsComponent } from './buttons/settings/settings.component'
import { FullscreenComponent } from './buttons/fullscreen/fullscreen.component'
import { LanguagesComponent } from './buttons/languages/languages.component'
import { SearchComponent } from './buttons/search/search.component'
import { MessagesComponent } from './buttons/messages/messages.component'
import { BookmarksComponent } from './buttons/bookmarks/bookmarks.component'
import { NotificationsComponent } from './buttons/notifications/notifications.component'
import { AccountComponent } from './buttons/account/account.component'
import { HorizontalNavigationComponent } from './navigation/horizontal-navigation/horizontal-navigation.component'
import { VerticalNavigationComponent } from './navigation/vertical-navigation/vertical-navigation.component'
import { VerticalNavigationGroupItemComponent } from './navigation/vertical-navigation-group-item/vertical-navigation-group-item.component'
import { VerticalNavigationAsideItemComponent } from './navigation/vertical-navigation-aside-item/vertical-navigation-aside-item.component'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { CartComponent } from './buttons/cart/cart.component'
import { FlyoutNavigationComponent } from './navigation/flyout-navigation/flyout-navigation.component'
import { FlyoutNavigationGroupComponent } from './navigation/flyout-navigation-group/flyout-navigation-group.component'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { MobileNavigationComponent } from './navigation/mobile-navigation/mobile-navigation.component'
import { ModalsModule } from 'src/app/core/components/modals/modals.module'
import { ModalsModule as ModalsContainerModule } from '../modals/modals.module'
import { BannerComponent } from './banner/banner.component'

@NgModule({
  declarations: [
    LayoutComponent,
    EcommerceLayoutComponent,
    EmptyLayoutComponent,
    FooterComponent,
    SettingsComponent,
    FullscreenComponent,
    LanguagesComponent,
    SearchComponent,
    MessagesComponent,
    BookmarksComponent,
    CartComponent,
    NotificationsComponent,
    AccountComponent,
    HorizontalNavigationComponent,
    VerticalNavigationComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationAsideItemComponent,
    FlyoutNavigationComponent,
    FlyoutNavigationGroupComponent,
    MobileNavigationComponent,
    BannerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    ModalsModule,
    RouterModule,
    ModalsContainerModule,
    LocalizeRouterModule,
    TranslateModule.forChild()
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
