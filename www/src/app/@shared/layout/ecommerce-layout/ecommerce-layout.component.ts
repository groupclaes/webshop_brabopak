import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-ecommerce-layout',
  templateUrl: './ecommerce-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex flex-auto w-full' }
})
export class EcommerceLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
