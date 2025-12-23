import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
    selector: 'claes-notifications',
    templateUrl: './notifications.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NotificationsComponent {
  constructor() { }
}
