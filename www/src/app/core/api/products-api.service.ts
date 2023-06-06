import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, retryWhen, delay, take, firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { trimParameters } from '.'

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  constructor(
    private http: HttpClient
  ) { }

  get({ id, usercode, department, culture }: any): Promise<{ product: IProduct }> {
    const params = trimParameters({
      usercode,
      department,
      culture
    })

    return firstValueFrom(this.http.get<{ product: IProduct }>(`${environment.api}products/${id}`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  getBase({ id, usercode }: any): Promise<any> {
    const params = trimParameters({
      usercode
    })

    return firstValueFrom(this.http.get(`${environment.api}products/${id}/base`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  search(usercode?: number, filters?: IProductSearchFilters, ux?: string): Observable<any> {
    const params = trimParameters({
      usercode,
      culture: filters?.culture,
      ux
    })

    return this.http.post(`${environment.api}products/search`, filters, {
      params
    })
  }
}

export interface IProductBase {
  id: number
  name: string
  unit: string
  itemnum: string
  prices?: any[]
  taxes?: any[]
  type: string
  stack_size: number
  minimum_order_quantity: number
  color: string
  url: string
}

export interface IProduct extends IProductBase {
  description: string
  favorite?: any[]
  supplier_id: string
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

export interface IProductSearchFilters {
  culture?: string,
  query?: string,
  only_favorites?: boolean,
  only_promo?: boolean,
  only_new?: boolean,
  page?: number,
  per_page?: number,
  category_id?: number
}
