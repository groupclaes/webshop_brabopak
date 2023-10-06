import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service'

declare var require: any
const capitalize = require('capitalize')

@Component({
  selector: 'bra-flyout-navigation',
  templateUrl: './flyout-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlyoutNavigationComponent {
  _categories: ICategory[] = []
  activeCategory: any | undefined

  active: boolean = false

  constructor(
    api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    public auth: AuthService
  ) {
    api.menu().then(r => {
      this._categories = r.data
      this.ref.markForCheck()
    })
    auth.change.subscribe({
      next: () => {
        this.ref.markForCheck()
        console.log(this.auth.currentCustomer)
      }
    })
    auth.customerChange.subscribe({
      next: () => {
        this.ref.markForCheck()
        console.log(this.auth.currentCustomer)
      }
    })
  }

  activate() {
    this.active = !this.active
    this.ref.markForCheck()
  }

  isCategoryActive(category: any): boolean {
    return this.activeCategory?.id === category.id
  }

  activateCategory(category: any): void {
    if (this.activeCategory !== category)
      this.activeCategory = category
    this.ref.markForCheck()
  }

  get categories(): ICategory[] {
    return this._categories
  }

  itemName(item: any): string {
    return item.name.replace(/ /g, '-')
  }

  capitalize(text: string) {
    return capitalize.words(text, {
      skipWord: /^(en|de|het|et|a|pour|voor|om|van)$/
    })
  }

  close(): void {
    this.active = false
    this.activeCategory = undefined
    this.ref.markForCheck()
  }

  get canViewPromo(): boolean | undefined {
    return this.auth.currentCustomer?.promo
  }
}

export interface ICategory {
  id: number
  name: string
  children?: ICategory[]
}
