import { Injectable } from '@angular/core'
import { interval } from 'rxjs/internal/observable/interval'
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { filter, map } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  updatesAvailable: Observable<{ type: string; current: { hash: string; appData?: object }; available: { hash: string; appData?: object } }>

  constructor(public updates: SwUpdate) {
    if (updates.isEnabled) {
      interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate())
    }

    this.updatesAvailable = this.updates.versionUpdates.pipe(
      filter((evt: VersionReadyEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map((evt: VersionReadyEvent) => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      })))

    this.updatesAvailable.subscribe((evt) => {
      console.debug('updates available', evt.current, evt.available)
      this.promptUser()
    })
  }

  public hello(): void {
    console.log('Started checking for updates...')
  }

  private promptUser(): void {
    this.updates.activateUpdate().then(() => document.location.reload())
  }
}
