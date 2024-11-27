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
    private readonly api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    public auth: AuthService
  ) {
    auth.change.subscribe({
      next: () => this.ref.markForCheck()
    })
    auth.customerChange.subscribe({
      next: () => this.ref.markForCheck()
    })
    setTimeout(async () => {
      await this.init()
    }, 18)
  }

  async init() {
    const menu = await this.api.menu(this.auth.currentCustomer?.usercode)
    if (menu)
      this._categories = menu.data
    this.ref.markForCheck()
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

  itemName = (item: any) => item.name.replace(/ /g, '-')

  capitalize = (text: string) => capitalize.words(text, { skipWord: /^(en|de|het|et|a|pour|voor|om|van)$/ })

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
