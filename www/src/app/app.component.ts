import { ChangeDetectionStrategy, Component, ElementRef, Inject } from '@angular/core'
import pck from '../../package.json'

import { DOCUMENT, registerLocaleData } from '@angular/common'
import localeNlBE from '@angular/common/locales/nl-BE'
import localeFrBE from '@angular/common/locales/fr-BE'
import { TranslateService } from '@ngx-translate/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { filter, map, mergeMap } from 'rxjs'
import { MetaService } from './@shared/services/meta.service'
import { UpdateService } from './core/update.service'
import { Modal, ModalsService } from './@shared/modals/modals.service'

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
    private metaService: MetaService,
    updateService: UpdateService,
    private modalCtrl: ModalsService
  ) {
    updateService.hello()
    document.documentElement.lang = translate.currentLang
    _elementRef.nativeElement.removeAttribute('ng-version')

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
        if (!event.hidePolicy) {
          this.checkCookiePolicy()
        }
        // { title: string, description?: string }
        const { title, description, keywords, image } = event
        if (title && description && keywords && image) {
          const tranlsations = translate.instant([title, description, keywords, image])
          this.metaService.apply(tranlsations[title], tranlsations[description], tranlsations[keywords], tranlsations[image])
        }
      })
  }

  checkCookiePolicy() {
    if (this.policyRequired) {
      // close all modals before creating a new one
      this.modalCtrl.modals
        .filter(e => e.title === 'Jouw privacy, onze zorg')
        .forEach(modal => modal.close.emit())
      this.modalCtrl.show(new Modal('info', 'Jouw privacy, onze zorg', 'Brabopak gebruikt cookies om je een betere en meer gepersonaliseerde gebruikservaring te bieden. Ga je hiermee akkoord?', [
        {
          title: 'Ja',
          action: () => {
            window.localStorage.setItem('com.brabopak.shop.cookies', 'yes');
            (window as any).loadGA()
          }
        }, {
          title: 'Nee',
          color: 'danger',
          action: () => {
            window.sessionStorage.setItem('com.brabopak.shop.cookies', 'no')
          }
        }
      ]))
    }
  }

  get policyRequired() {
    return !(window.localStorage.getItem('com.brabopak.shop.cookies') === 'yes' || window.sessionStorage.getItem('com.brabopak.shop.cookies') === 'no') && navigator.cookieEnabled
  }
}
