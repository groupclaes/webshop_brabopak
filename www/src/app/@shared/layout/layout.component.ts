import { Component } from '@angular/core'
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router'
import { filter, map, mergeMap } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { LayoutService } from './layout.service'

@Component({
  selector: 'claes-layout',
  templateUrl: './layout.component.html',
  host: {
    class: 'flex flex-auto w-full min-w-0 max-w-full'
  }
})
export class LayoutComponent {
  private _forcedLayout: string | null = null

  constructor(
    router: Router,
    route: ActivatedRoute,
    private layoutService: LayoutService
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(
        map(() => {
          let cr = route
          while (cr.firstChild) {
            cr = cr.firstChild
          }
          return cr
        }),
        filter(cr => cr.outlet === 'primary'),
        mergeMap(cr => cr.data)
      )
      .subscribe((data: any) => {
        this._forcedLayout = (data && data.layout) ? data.layout : null
      })
  }

  get layout(): string {
    return (this._forcedLayout !== null) ? this._forcedLayout : this.layoutService.current.toString()
  }

  get forcedLayout(): boolean {
    return this._forcedLayout !== null || environment.production
  }
}
