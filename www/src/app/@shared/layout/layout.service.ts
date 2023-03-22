import { isPlatformBrowser } from '@angular/common'
import { EventEmitter, Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { environment } from 'src/environments/environment'

const LAYOUT_STORAGE_KEY = environment.storageKey + '.layout'

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _layout: Layout = Layout.EMPTY

  layoutChange: EventEmitter<Layout> = new EventEmitter<Layout>()

  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    const current_layout = this.storage.getItem(LAYOUT_STORAGE_KEY)
    if (current_layout) {
      const typed_current_layout = current_layout.toUpperCase() as keyof typeof Layout
      if (Layout[typed_current_layout]) {
        this._layout = Layout[typed_current_layout]
      } else this.loadDefault()
    } else this.loadDefault()

    this.layoutChange.emit(this._layout)
    this.layoutChange.subscribe(layout => {
      this._layout = layout
      this.storage.setItem(LAYOUT_STORAGE_KEY, `${layout}`)
    })
  }

  private get storage(): Storage {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage
    } else {
      return {
        clear: () => undefined,
        getItem: (key) => { return key === LAYOUT_STORAGE_KEY ? 'ecommerce' : null },
        length: 0,
        key: (index) => null,
        setItem: (key, value) => null,
        removeItem: (key) => null
      }
    }
  }

  private loadDefault(): void {
    this._layout = Layout.MATERIAL
  }

  get current(): Layout {
    return this._layout
  }

  setLayout(layout: Layout): void {
    this.layoutChange.emit(layout)
  }
}

export enum Layout {
  CENTERED = 'centered',
  CLASSIC = 'classic',
  CLASSY = 'classy',
  COMPACT = 'compact',
  DENSE = 'dense',
  ECOMMERCE = 'ecommerce',
  EMPTY = 'empty',
  ENTERPRISE = 'enterprise',
  FUTURISTIC = 'futuristic',
  MATERIAL = 'material',
  MODERN = 'modern',
  THIN = 'thin'
}