import { NgModule } from '@angular/core'
import { Location } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule, routes } from './app-routing.module'
import { AppComponent } from './app.component'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { LayoutModule } from './@shared/layout/layout.module'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from './auth/auth.interceptor'
import { AtSharedModule } from './@shared/@shared.module'
import { HttpLoaderFactory } from './@shared/loaders/translate-browser.loader'
import { LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings, ManualParserLoader } from '@gilsdav/ngx-translate-router'
import { environment } from 'src/environments/environment'

export function localizeLoaderFactory(translate: TranslateService, location: Location, settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, environment.supportedLanguages.map(e => e.split('-')[0]), 'ROUTES.', '!')
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    AtSharedModule,
    LayoutModule,
    TranslateModule.forRoot({
      useDefaultLang: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LocalizeRouterModule.forRoot([...routes], {
      useCachedLang: false,
      parser: {
        provide: LocalizeParser,
        useFactory: localizeLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings]
      }
    }),
    NoopAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
