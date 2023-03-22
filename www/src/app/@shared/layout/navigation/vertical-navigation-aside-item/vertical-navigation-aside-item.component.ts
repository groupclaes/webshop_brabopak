import { Component, ChangeDetectionStrategy, Input } from '@angular/core'

@Component({
  selector: 'claes-vertical-navigation-aside-item',
  templateUrl: './vertical-navigation-aside-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: ''
  }
})
export class VerticalNavigationAsideItemComponent {
  @Input() link: any[] = ['/']
  @Input() icon: string = 'fa-home'
  @Input() title: string | undefined

  constructor() { }
}
