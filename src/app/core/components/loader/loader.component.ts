import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'bra-loader',
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block'
  }
})
export class LoaderComponent {

}
