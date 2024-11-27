import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ICategory } from '../flyout-navigation/flyout-navigation.component'

declare var require: any
const capitalize = require('capitalize')

@Component({
  selector: 'bra-flyout-navigation-group',
  templateUrl: './flyout-navigation-group.component.html'
})
export class FlyoutNavigationGroupComponent {
  @Input() category: ICategory | undefined
  @Input() active: boolean = false
  @Output() activateChange: EventEmitter<void> = new EventEmitter<void>()

  get name(): string {
    return this.capitalize(this.category?.name ?? '')
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-')
  }

  capitalize(text: string) {
    return capitalize.words(text, {
      skipWord: /^(en|de|het|et|a|pour|voor|om|van)$/
    })
  }
}
