import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'claes-cart',
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  constructor() { }
}
