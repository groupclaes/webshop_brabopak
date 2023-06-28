import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { EcommerceApiService } from 'src/app/core/api/ecommerce-api.service';
import { PcmApiService } from 'src/app/core/api/pcm-api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'bra-cart-detail-page',
  templateUrl: './cart-detail-page.component.html',
  styles: [
  ]
})
export class CartDetailPageComponent implements OnInit {
  isLoading: boolean = false
  order?: any
  order_id?: number

  constructor(
    private auth: AuthService,
    private api: EcommerceApiService,
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private pcm: PcmApiService
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    this.ref.markForCheck()

    const element: HTMLElement | null = window.document.getElementById('myHtml')
    if (element) {
      element.style.setProperty('overflow', 'auto')
    }

    this.route.params.subscribe(params => {
      this.order_id = +params['id']
    })

    if (this.auth && this.auth.isAuthenticated()) {
      this.loadOrder()
    }
    this.auth.change.subscribe((credential) => {
      if (credential) {
        this.loadOrder()
      }
    })
  }

  async loadOrder() {
    if (!this.auth.currentCustomer || !this.order_id) return

    try {
      const r = await this.api.order(this.order_id, this.auth.currentCustomer.usercode)
      if (r) {
        console.log(r)
        // this.order = r.order
        // this.order.orderLines.forEach(async (product: any) => {
        //   try {
        //     await this.pcm.checkDatasheetHead(product.itemNum, this.culture)
        //     product.hasDatasheet = true
        //     this.ref.markForCheck()
        //   } catch { }
        // })
        this.ref.markForCheck()
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

  getDatasheetUrl(product: any) {
    return `${environment.pcm}content/dis/artikel/datasheet/${product.itemNum}/${this.culture}`
  }

  get culture(): string {
    return this.translate.currentLang
  }
}
