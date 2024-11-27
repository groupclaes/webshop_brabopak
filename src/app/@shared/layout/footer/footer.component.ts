import { ChangeDetectionStrategy, Component } from '@angular/core'
import pck from '../../../../../package.json'

@Component({
  selector: 'claes-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col sm:flex-row text-sm'
  }
})
export class FooterComponent {
  constructor() { }

  get year(): number {
    return new Date().getFullYear()
  }

  get version(): string {
    return pck.version
  }
}
