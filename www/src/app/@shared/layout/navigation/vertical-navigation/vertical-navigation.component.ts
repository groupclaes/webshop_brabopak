import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'claes-vertical-navigation',
  templateUrl: './vertical-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalNavigationComponent {
  @Input() appearance: string = 'default'

  @HostBinding('class') get hostClasses() {
    const classList = `claes-vertical-navigation-appearance-${this.appearance}`.split(' ')

    switch (this.appearance) {
      case 'thin':
        classList.push('w-[80px]', 'min-w-[80px]', 'max-w-[80px]')
        break

      case 'compact':
        classList.push('w-[112px]', 'min-w-[112px]', 'max-w-[112px]')
        break

      default:
        classList.push('w-nav', 'min-w-nav', 'max-w-nav')
        break
    }

    return classList
  }

  constructor() { }
}
