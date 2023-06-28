import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { trimParameters } from '.'
import { IProductBase } from './products-api.service'

@Injectable({
  providedIn: 'root'
})
export class EcommerceApiService {
  constructor(
    private http: HttpClient
  ) { }

  get urls() {
    return {
      menu: () => `${environment.api}ecommerce/menu`,
      dashboard: () => `${environment.api}ecommerce/dashboard`,
      cart: () => `${environment.api}ecommerce/carts`,
      cartProduct: () => `${environment.api}ecommerce/carts/products`,
      orders: () => `${environment.api}ecommerce/orders`,
      order: (id: number) => `${environment.api}ecommerce/orders/${id}`
    }
  }

  menu(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.urls.menu()))
  }

  dashboard(usercode: number): Promise<any> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<any>(this.urls.dashboard(), { params }))
  }

  cart(usercode: number): Promise<ICart[]> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<ICart[]>(this.urls.cart(), { params }))
  }

  orders(usercode: number): Promise<IGetCartHistryResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IGetCartHistryResponse>(this.urls.orders(), { params }))
  }

  order(id: number, usercode: number): Promise<IGetCartResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IGetCartResponse>(this.urls.order(id), { params }))
  }

  putCartProduct(product: any, usercode: number): Promise<ICart[]> {
    const params = {
      usercode
    }
    return firstValueFrom(this.http.put<ICart[]>(this.urls.cartProduct(), product, { params }))
  }

  postCart(form: any) {
    return firstValueFrom(this.http.post<any>(this.urls.cart(), form))
  }
}

export interface ICart {
  id: number
  modified?: Date
  products?: ICartProduct[]
}

export interface ICartProduct extends IProductBase {
  quantity: number
}

export interface IGetCartHistryResponse {
  statusCode: number
  result: {
    orders: {
      id: number
      reference: string
      date: string
      method: string
      orderLines: {
        id: number
        itemNum: string
        itemName: string
        unit: string
      }[]
    }[]
  }
}

export interface IGetCartResponse {
  statusCode: number
  result: {
    orders: {
      id: number
      reference: string
      date: string
      method: string
      orderLines: {
        id: number
        itemNum: string
        itemName: string
        unit: string
      }[]
    }[]
  }
}