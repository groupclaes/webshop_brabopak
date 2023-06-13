import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'
import { AuthService, ICustomer } from 'src/app/auth/auth.service'

@Component({
  selector: 'bra-customer-modal',
  templateUrl: './customer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerModalComponent {
  @Input() title: string = 'Selecteer een klant'
  @Output() close: EventEmitter<void> = new EventEmitter<void>()

  query: string = ''

  constructor(public auth: AuthService) {

  }

  select(customer: ICustomer) {
    this.auth.currentCustomer = customer
    this.close.emit()
  }

  get customers(): ICustomer[] {
    let query = this.query.trim().toLocaleLowerCase()

    if (query.length <= 0)
      return this.auth.customers

    return this.auth.customers.filter(customer =>
      customer.name.toLocaleLowerCase().includes(query) ||
      customer.city.toLocaleLowerCase().includes(query) ||
      customer.id.toString().includes(query) || (
        customer.address_id > 0 && (
          customer.address_id.toString().includes(query) ||
          customer.address_name.toLocaleLowerCase().includes(query) ||
          customer.address_city.toLocaleLowerCase().includes(query)
        )
      )
    )
  }
}
