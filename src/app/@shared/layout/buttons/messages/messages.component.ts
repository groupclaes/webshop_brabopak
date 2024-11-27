import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'claes-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {
  constructor() { }
}
