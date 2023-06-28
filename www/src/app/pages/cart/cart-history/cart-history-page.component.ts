import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from 'src/app/auth/auth.service'
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service'

@Component({
  selector: 'bra-cart-history-page',
  templateUrl: './cart-history-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartHistoryPageComponent {
  orders: any[] = []
  isLoading: boolean = false

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  @HostListener('window:resize', ['$event.target'])
  onResize() {
    setTimeout(() => {
      this.orders.forEach(order => this.calcWide(order))
    }, 50)
  }

  ngOnInit(): void {
    this.isLoading = true
    this.ref.markForCheck()

    const element: HTMLElement | null = window.document.getElementById('myHtml')
    if (element) {
      element.style.setProperty('overflow', 'auto')
    }

    if (this.auth && this.auth.isAuthenticated()) {
      this.loadOrderHistory()
    }
    this.auth.change.subscribe((credential) => {
      if (credential) {
        this.loadOrderHistory()
      }
    })
  }

  async loadOrderHistory() {
    if (!this.auth.currentCustomer) return

    try {
      const r = await this.api.orders(this.auth.currentCustomer.usercode)
      if (r) {
        this.orders = r.result.orders
        this.ref.markForCheck()
        setTimeout(() => {
          this.orders.forEach(order => this.calcWide(order))
        }, 50)
      } else if (!r) {
        // no orders
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.isLoading = false
      this.ref.markForCheck()
    }
  }

  calcWide(order: { id: number, nextArrow: boolean, prevArrow: boolean }, $event?: any) {
    if ($event) {
      $event.preventDefault()
    }
    this.showEnd(order)
    this.ref.markForCheck()
  }

  showEnd(order: { id: number, nextArrow: boolean, prevArrow: boolean }) {
    const container = document.getElementById('order-swipe-container' + order.id)
    const content = document.getElementById('order-swipe-content' + order.id)

    if (container && content) {
      order.prevArrow = container.scrollLeft > 0
      order.nextArrow = container.scrollWidth > content.clientWidth + container.scrollLeft
      return
    }
    order.prevArrow = false
    order.nextArrow = false
  }

  scrollRight(order: any) {
    const container = document.getElementById('order-swipe-container' + order.id) as HTMLDivElement
    this.scroll('right', container)
    this.calcWide(order)
  }

  scrollLeft(order: any) {
    const container = document.getElementById('order-swipe-container' + order.id) as HTMLDivElement
    this.scroll('left', container)
    this.calcWide(order)
  }

  scroll(direction: string, element: HTMLDivElement) {
    switch (direction) {
      case 'left':
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        })
        break

      case 'right':
        element.scrollTo({
          left: 0,
          behavior: 'smooth'
        })
        break
    }
  }

  itemName(item: any): string {
    return item.itemName.replace(/ /g, '-').toLowerCase()
  }

  get culture(): string {
    return this.translate.currentLang
  }
}
