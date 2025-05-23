import { Injectable } from '@angular/core'
import { interval } from 'rxjs/internal/observable/interval'
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker'
import { filter, map } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  updatesAvailable: Observable<{ type: string; current: { hash: string; appData?: object }; available: { hash: string; appData?: object } }>

  constructor(public updates: SwUpdate) {
    if (updates.isEnabled)
      interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate())

    this.updatesAvailable = this.updates.versionUpdates.pipe(
      filter((evt: VersionEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map((evt: VersionReadyEvent) => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      })))

    this.updatesAvailable.subscribe((evt) => {
      console.debug('updates available', evt.current, evt.available)
      const current = localStorage.getItem('com.brabopak.shop.current-version')
      if (!current || (current && current === evt.current.hash)) {
        // do update
        localStorage.setItem('com.brabopak.shop.current-version', evt.available.hash)
        this.promptUser()
      } else if (current && current === evt.available.hash) {
        // app is already latest ??, skip update
        console.debug('updatesAvailable, proc while on latest version. This should be reported')
      }
    })
  }

  public hello(): void {
    console.log('Started checking for updates...')
  }

  private promptUser(): void {
    this.updates.activateUpdate().then(
      () => {
        if (!sessionStorage.getItem('com.brabopak.shop.reload')) {
          sessionStorage.setItem('com.brabopak.shop.reload', 'x')
          document.location.reload()
        }
      }
    )
  }
}
