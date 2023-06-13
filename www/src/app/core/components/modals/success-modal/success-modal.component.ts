import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'bra-success-modal',
  templateUrl: './success-modal.component.html',
  host: {
    class: 'block'
  }
})
export class SuccessModalComponent {
  @Input() title: string = 'Alert title'
  @Input() message: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas id efficitur enim. Ut ac orci dapibus, aliquam nisi vel, dignissim nibh. Nunc pretium efficitur sodales.'

  @Output() close: EventEmitter<void> = new EventEmitter<void>()
}
