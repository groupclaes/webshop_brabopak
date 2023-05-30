import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CartService } from './cart.service';

@Component({
  selector: 'claes-cart',
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  constructor(public service: CartService) {
    console.debug('CartComponent -- service', this.service)
  }
}
