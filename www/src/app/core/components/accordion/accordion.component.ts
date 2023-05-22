import { Component, Input } from '@angular/core'

@Component({
  selector: 'bra-accordion',
  templateUrl: './accordion.component.html',
  host: {
    class: 'block py-6'
  }
})
export class AccordionComponent {
  @Input() header: string = ''
  @Input() expanded: boolean = false
}
