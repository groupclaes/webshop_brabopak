import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { retryWhen, delay, take, firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IBaseApiResponse, trimParameters } from '.'

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  constructor(
    private http: HttpClient
  ) { }

  get({ id, usercode, department, culture }: any): Promise<IGetProductResponse> {
    const params = trimParameters({
      usercode,
      department,
      culture
    })

    return firstValueFrom(this.http.get<IGetProductResponse>(`${environment.api}products/${id}`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  getBase({ id, usercode }: any): Promise<IGetProductBaseResponse> {
    const params = trimParameters({
      usercode
    })

    return firstValueFrom(this.http.get<IGetProductBaseResponse>(`${environment.api}products/${id}/base`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  putFavorite({ id, usercode, mode }: any): Promise<IBaseApiResponse> {
    const params = trimParameters({
      usercode,
      mode
    })

    return firstValueFrom(this.http.put<IBaseApiResponse>(`${environment.api}products/${id}/favorite`, {}, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  putDescription({ id, usercode, description }: any): Promise<IBaseApiResponse> {
    const params = trimParameters({
      usercode
    })

    return firstValueFrom(this.http.put<IBaseApiResponse>(`${environment.api}products/${id}/description`, { description }, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  deleteDescription({ id, usercode }: any): Promise<IBaseApiResponse> {
    const params = trimParameters({
      usercode
    })

    return firstValueFrom(this.http.delete<IBaseApiResponse>(`${environment.api}products/${id}/description`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }
}

export interface IGetProductResponse extends IBaseApiResponse {
  data: { product: IProduct }
}
export interface IGetProductBaseResponse extends IBaseApiResponse {
  data: { product: IProductBase }
}

export interface IProductBase {
  id: number
  name: string
  unit: string
  itemnum: string
  prices?: IProductPrice[]
  taxes?: any[]
  type: string
  is_new: boolean
  stack_size: number
  minimum_order_quantity: number
  color: string
  url: string
}

export interface IProduct extends IProductBase {
  description: string
  customer_description?: string
  favorite?: any[]
  supplier_id: string
  delivery_time: number
  available_on?: Date
  in_backorder?: boolean
  attributes?: any[]
  breadcrumbs: any[]
  features?: any[]
  allergens?: {
    code: string
    value: string
  }[]
  relatedProducts: any[]
  similarProducts: any[]
}

export interface IProductPrice {
  base: number
  is_promo: boolean
  amount: number
  discount: number
  quantity: number
}
