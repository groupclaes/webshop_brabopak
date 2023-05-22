import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  current: string = ''
  change: EventEmitter<string> = new EventEmitter<string>()
  ignoreNext: boolean = false

  constructor(
    private router: Router
  ) {
    this.change.subscribe(query => {
      if (JSON.stringify(query) !== JSON.stringify(this.current)) {
        this.current = query
        this.reload(query)
      }
    })
  }

  update(query: string) {
    if (this.ignoreNext) {
      this.ignoreNext = false
      return
    }

    this.change.emit(query.toLocaleLowerCase())
  }

  set(query?: string) {
    if (!query) {
      query = undefined
    } else {
      query = query.toLocaleLowerCase()
    }
    this.ignoreNext = true
    this.change.emit(query)
  }

  reload(query: string) {
    this.router.navigate([], {
      queryParams: {
        query
      },
      replaceUrl: true
    })
  }
}
