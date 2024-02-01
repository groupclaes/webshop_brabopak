import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { REQUEST } from '../../../express.tokens'
import { Request } from 'express'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BrowserLanguageService {
  userLang: string | null = null

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Optional()
    @Inject(REQUEST) private request: Request
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.userLang = window.navigator.language
    } else {
      const headerVal = this.request.headers['accept-language']
      if (headerVal) {
        this.userLang = headerVal.substring(0, 2)
      }
    }
  }

  getLanguage(): string {
    return this.userLang || environment.defaultLanguage
  }
}