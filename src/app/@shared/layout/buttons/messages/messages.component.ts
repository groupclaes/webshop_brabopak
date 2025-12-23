import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
    selector: 'claes-messages',
    templateUrl: './messages.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MessagesComponent {
  constructor() { }
}
