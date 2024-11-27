import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'bra-products-block',
  templateUrl: './products-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col p-4 dark:rounded-xl dark:bg-gray-800'
  }
})
export class ProductsBlockComponent {
  @Input() header: string = ''
  @Input() link: string | undefined
  @Input() items: any[] = []

  constructor(private translate: TranslateService) { }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-').toLowerCase()
  }

  get culture(): string {
    return environment.supportedLanguages.find(e => e.startsWith(this.translate.currentLang)) ?? environment.defaultLanguage
  }

  get url(): string {
    if (this.link)
      return this.link.split('?')[0]
    return '/'
  }

  get params() {
    if (this.link?.includes('?')) {
      const params: any = {}
      for (const [key, value] of new URLSearchParams(this.link.substring(this.link.indexOf('?'))).entries()) {
        params[key] = value
      }
      return params
    }
    return undefined
  }
}
