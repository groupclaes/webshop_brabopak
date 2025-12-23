import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
    selector: 'claes-bookmarks',
    templateUrl: './bookmarks.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BookmarksComponent {
  constructor() { }
}
