import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IBaseApiResponse, trimParameters } from '.'
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
      carts: () => `${environment.api}ecommerce/carts`,
      cart: (id: number) => `${environment.api}ecommerce/carts/${id}`,
      cartProduct: () => `${environment.api}ecommerce/carts/products`,
      orders: () => `${environment.api}ecommerce/orders`,
      order: (id: number) => `${environment.api}ecommerce/orders/${id}`
    }
  }

  menu(): Promise<IBaseApiResponse> {
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.menu()))
  }

  dashboard(usercode: number): Promise<IBaseApiResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.dashboard(), { params }))
  }

  cart(usercode: number): Promise<IGetCartsResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IGetCartsResponse>(this.urls.carts(), { params }))
  }

  orders(usercode: number): Promise<IGetOrderHistoryResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IGetOrderHistoryResponse>(this.urls.orders(), { params }))
  }

  order(id: number, usercode: number): Promise<IGetOrderResponse> {
    const params = trimParameters({
      usercode
    })
    return firstValueFrom(this.http.get<IGetOrderResponse>(this.urls.order(id), { params }))
  }

  putCartProduct(product: any, usercode: number): Promise<IGetCartsResponse> {
    const params = {
      usercode
    }
    return firstValueFrom(this.http.put<IGetCartsResponse>(this.urls.cartProduct(), product, { params }))
  }

  postCart(id: number, form: any) {
    return firstValueFrom(this.http.post<IBaseApiResponse>(this.urls.cart(id), form))
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

export interface IGetCartsResponse extends IBaseApiResponse {
  data: ICart[]
}

export interface IGetOrderHistoryResponse extends IBaseApiResponse {
  data: {
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

export interface IGetOrderResponse extends IBaseApiResponse {
  data: {
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