import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'claes-languages',
  templateUrl: './languages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguagesComponent {
  constructor(
    private translate: TranslateService
  ) { }

  updateLanguage(language: string, $event: any): void {
    this.translate.use(language)
    $event.preventDefault()
    $event.stopPropagation()
    const elem = ($event.target as HTMLLIElement)
    if (elem.parentElement) {
      elem.parentElement.style.pointerEvents = 'none'
      setTimeout(() => {
        if (elem.parentElement) {
          elem.parentElement.style.pointerEvents = ''
        }
      }, 18)
    }
  }

  get languages(): string[] {
    return environment.supportedLanguages
  }
}
