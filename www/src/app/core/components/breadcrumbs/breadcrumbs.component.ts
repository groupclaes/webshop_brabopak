import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'

@Component({
  selector: 'bra-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-row items-center space-x-2 text-gray-500 overflow-hidden'
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

  constructor(private localize: LocalizeRouterService) { }

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
}

export interface IBreadcrumbLink extends IBreadcrumb {
  link: any[]
}

export interface IBreadcrumb {
  name: string
  id?: number
  product_id?: number
}