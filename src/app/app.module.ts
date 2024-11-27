import { NgModule, isDevMode } from '@angular/core'
import { Location } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule, routes } from './app-routing.module'
import { AppComponent } from './app.component'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { LayoutModule } from './@shared/layout/layout.module'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { AuthInterceptor } from './auth/auth.interceptor'
import { AtSharedModule } from './@shared/@shared.module'
import { HttpLoaderFactory } from './@shared/loaders/translate-browser.loader'
import { LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings, ManualParserLoader } from '@gilsdav/ngx-translate-router'
import { environment } from 'src/environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker'

export function localizeLoaderFactory(translate: TranslateService, location: Location, settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, environment.supportedLanguages.map(e => e.split('-')[0]), 'ROUTES.', '!')
}

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule.withServerTransition({ appId: 'serverApp' }),
        AppRoutingModule,
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
        NoopAnimationsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        })], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
