import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ICategory } from '../flyout-navigation/flyout-navigation.component'

@Component({
  selector: 'bra-flyout-navigation-group',
  templateUrl: './flyout-navigation-group.component.html',
  styles: [
  ]
})
export class FlyoutNavigationGroupComponent {
  @Input() category: ICategory | undefined

  @Input() active: boolean = false

  @Output() activateChange: EventEmitter<void> = new EventEmitter<void>()

  get name(): string {
    return this.category?.name || ''
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-')
  }
}
