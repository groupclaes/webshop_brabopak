import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'claes-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent {
  constructor() { }
}
