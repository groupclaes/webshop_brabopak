import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { Router } from '@angular/router'
import { SearchService } from './search.service'
// import { ManageApiService } from 'src/app/core/api/manage-api.service'

@Component({
  selector: 'claes-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  query: string = ''
  lastEvent: string = ''

  public active: boolean = false
  public filtersShown: boolean = false

  suggestions: ISuggestedAction[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private searchService: SearchService
    // private manageApi: ManageApiService
  ) {
    this.query = this.searchService.current ?? ''
    this.lastEvent = this.query
    this.ref.markForCheck()

    this.searchService.change.subscribe(query => {
      if (query) {
        this.query = query
        this.ref.markForCheck()
      }
    })
  }

  private async updateSuggestions() {
    // try {
    // const result = await this.manageApi.search(this.query)
    // if (result) {
    // this.suggestions = result.result
    // }
    // } catch (err) {
    // if (err.status !== 404) {
    // console.trace(err)
    // }
    // } finally {
    // setTimeout(_ => {
    // this.ref.markForCheck()
    // })
    // }
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
  }

  search() {
    this.hideFilters()
    if (this.lastEvent != this.query)
      this.searchService.set(this.query)
    this.lastEvent = this.query
    this.ref.markForCheck()
  }

  searchQuery(suggestion: ISuggestedAction): void {
    switch (suggestion.action) {
      case 'route':
        if (!suggestion.route) return

        let params
        if (suggestion.params)
          params = JSON.parse(suggestion.params)

        this.router.navigate([suggestion.route], {
          queryParams: {
            ...params,
            query: this.query
          }
        })
        this.hideFilters()
        this.toggle()
        break

      case 'search':
        if (suggestion.query) {
          this.query = suggestion.query
          this.ref.markForCheck()
          this.search()
        }
        break

      default:
        console.error(`Unknown action: '${suggestion.action}'`)
        return
    }
  }

  hideFilters() {
    setTimeout(() => {
      this.filtersShown = false
      // this.updateSuggestions()
      this.ref.markForCheck()
    }, 80)
  }

  showFilters(hightlight: boolean = false) {
    this.filtersShown = true

    if (hightlight === true) {
      setTimeout(() => {
        document.getElementById('search_field')?.focus()
        document.getElementById('search_filters')?.classList.add('hightlight')
      }, 18)
    }

    if (this.suggestions.length === 0) {
      this.updateSuggestions()
    }
    this.ref.markForCheck()
  }
}

export interface ISuggestedAction {
  action: 'route' | 'search',
  text: string,
  query?: string
  route?: string,
  params?: string
}