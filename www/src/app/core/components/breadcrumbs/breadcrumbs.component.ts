import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'
import { SearchService } from 'src/app/@shared/layout/buttons/search/search.service'

@Component({
  selector: 'bra-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block text-gray-500 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 overflow-hidden'
  }
})
export class BreadcrumbsComponent {
  private _breadcrumbs: IBreadcrumbLink[] = []

  @Input() set breadcrumbs(breadcrumbs: IBreadcrumb[]) {
    this._breadcrumbs = breadcrumbs.map(b => ({
      ...b,
      link: this.get_link(breadcrumbs, b)
    }))
  }
  get breadcrumbs(): IBreadcrumbLink[] {
    return this._breadcrumbs
  }

  constructor(
    private localize: LocalizeRouterService,
    private service: SearchService
  ) { }

  get_link(breadcrumbs: IBreadcrumb[], breadcrumb: IBreadcrumb): any[] {
    if (!breadcrumb.id && !breadcrumb.product_id) {
      return [this.localize.translateRoute('/products')]
    }

    if (breadcrumb.product_id) {
      return [this.localize.translateRoute('/product'), breadcrumb.product_id, breadcrumb.name.replace(/ /g, '-').toLowerCase()]
    }

    if (breadcrumb.id) {
      const breadcrumb_index = breadcrumbs.findIndex(b => b.id === breadcrumb.id)
      const names = []
      for (let i = 1; i <= breadcrumb_index; i++) {
        names.push(breadcrumbs[i].name.replace(/ /g, '-').toLowerCase())
      }
      return [this.localize.translateRoute('/products'), ...names]
    }

    return [this.localize.translateRoute('/')]
  }

  get params(): any {
    return {
      query: this.service.current.query
    }
  }
}

export interface IBreadcrumbLink extends IBreadcrumb {
  link: any[]
}

export interface IBreadcrumb {
  name: string
  id?: number
  product_id?: number
}