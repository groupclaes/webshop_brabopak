import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { SearchService } from './search.service'
import { AuthService } from 'src/app/auth/auth.service'
import { SearchApiService } from 'src/app/core/api/search-api.service'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs'

@Component({
  selector: 'claes-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  query: string | undefined
  lastEvent: string | undefined

  public active: boolean = false
  public filtersShown: boolean = false

  suggested: string[] = []
  popular: string[] = []

  constructor(
    private ref: ChangeDetectorRef,
    public service: SearchService,
    private auth: AuthService,
    private searchApi: SearchApiService,
    private router: Router
  ) {
    this.query = this.service.query ?? ''
    this.lastEvent = this.query
    this.ref.markForCheck()

    this.service.Refresh.subscribe(() => {
      this.query = this.service.query
      this.updateSuggestions()
      this.ref.markForCheck()
    })

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
      if (this.active && (!this.query || this.query?.trim().length === 0))
        this.close()
    })
  }

  private async updateSuggestions() {
    try {
      const result = await this.searchApi.get(this.query ?? '', this.service.culture, this.service.id)
      if (result) {
        this.suggested = result.data.results ?? []
        this.popular = result.data.popular ?? []
      }
    } catch (err: any) {
      if (err.status !== 404) {
        console.trace(err)
      }
    } finally {
      setTimeout(() => {
        this.ref.markForCheck()
      })
    }
  }

  doKeyDown($event: any) {
    if (!this.filtersShown) {
      this.filtersShown = true
    }
    if ($event.keyCode === 13) {
      this.search()
    }
  }

  doKeyUp($event: any) {
    if ($event && $event.keyCode !== 13) {
      this.updateSuggestions()
    }
  }

  close(): void {
    this.active = false
    this.ref.markForCheck()
  }

  toggle(): void {
    this.active = !this.active

    if (this.active)
      setTimeout(() => {
        document.getElementById('search_field')?.focus()
      }, 80)
  }

  searchQuery(query: string) {
    this.service.query = query
    this.ref.markForCheck()
    this.search()
  }

  search() {
    this.hideFilters()
    this.close()
    if (this.lastEvent != this.query)
      this.service.query = this.query
    this.lastEvent = this.query
    this.ref.markForCheck()
  }

  // searchQuery(suggestion: ISuggestedAction): void {
  //   switch (suggestion.action) {
  //     case 'route':
  //       if (!suggestion.route) return

  //       let params
  //       if (suggestion.params)
  //         params = JSON.parse(suggestion.params)

  //       this.router.navigate([suggestion.route], {
  //         queryParams: {
  //           ...params,
  //           query: this.query
  //         }
  //       })
  //       this.hideFilters()
  //       this.toggle()
  //       break

  //     case 'search':
  //       if (suggestion.query) {
  //         this.query = suggestion.query
  //         this.ref.markForCheck()
  //         this.search()
  //       }
  //       break

  //     default:
  //       console.error(`Unknown action: '${suggestion.action}'`)
  //       return
  //   }
  // }

  hideFilters() {
    setTimeout(() => {
      this.filtersShown = false
      this.updateSuggestions()
      this.ref.markForCheck()
    }, 80)
  }

  showFilters() {
    this.filtersShown = true
    this.ref.markForCheck()

    if (this.suggested.length === 0) {
      this.updateSuggestions()
    }
  }

  change(varname: 'only_favorites' | 'only_promo' | 'only_new') {
    setTimeout(() => {
      this.service[varname] = this.service[varname] === undefined
      this.ref.markForCheck()
    })
  }

  get authorized(): boolean {
    return this.auth.isAuthenticated()
  }
}

export interface ISuggestedAction {
  action: 'route' | 'search',
  text: string,
  query?: string
  route?: string,
  params?: string
}