import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject } from '@angular/core'
import pck from '../../package.json'

import { DOCUMENT, registerLocaleData } from '@angular/common'
import localeNlBE from '@angular/common/locales/nl-BE'
import localeFrBE from '@angular/common/locales/fr-BE'
import { TranslateService } from '@ngx-translate/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { filter, map, mergeMap } from 'rxjs'
import { MetaService } from './@shared/services/meta.service'
import { environment } from 'src/environments/environment'

registerLocaleData(localeNlBE)
registerLocaleData(localeFrBE)

@Component({
  selector: 'bra-root',
  template: '<claes-layout></claes-layout>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-auto w-full h-full',
    'app-version': pck.version
  }
})
export class AppComponent {
  constructor(
    _elementRef: ElementRef,
    translate: TranslateService,
    @Inject(DOCUMENT) document: Document,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private metaService: MetaService
  ) {
    document.documentElement.lang = translate.currentLang
    _elementRef.nativeElement.removeAttribute('ng-version')
    // this.initTranslateService(translate)

    this.ngOnInit(translate)
  }

  ngOnInit(translate: TranslateService) {
    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    onNavigationEnd
      .pipe(
        map(() => {
          let route = this.activatedRoute
          while (route.firstChild) {
            route = route.firstChild
          }
          return route
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe((event: any) => {
        // { title: string, description?: string }
        const { title, description, keywords, image } = event
        if (title && description && keywords && image) {
          const tranlsations = translate.instant([title, description, keywords, image])
          this.metaService.apply(tranlsations[title], tranlsations[description], tranlsations[keywords], tranlsations[image])
        }
      })
  }
}
