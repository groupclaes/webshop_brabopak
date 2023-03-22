import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, retryWhen, delay, take, firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { trimParameters } from '.'
const url = 'https://api.groupclaes.be/v1/distribution/shop/products'

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  constructor(
    private http: HttpClient
  ) { }

  get({ id, token, usercode, department, culture, ux }: any): Promise<any> {
    const params = trimParameters({
      token,
      usercode,
      department,
      culture,
      ux
    })

    return firstValueFrom(this.http.get(`${url}/${id}`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  getBase({ id, token, usercode }: any): Promise<any> {
    const params = trimParameters({
      token,
      usercode
    })

    return firstValueFrom(this.http.get(`${url}/${id}/base`, { params })
      .pipe(retryWhen(errors => errors.pipe(delay(environment.performance.time_out), take(environment.performance.retries))))
      .pipe(delay(environment.performance.delay_medium)))
  }

  search(token?: string, userCode?: number, filters?: IProductSearchFilters, ux?: string): Promise<any> {
    const params = trimParameters({
      token,
      userCode,
      culture: filters?.culture,
      ux
    })

    return firstValueFrom(this.http.post(`${url}/search`, filters, {
      params
    }))
  }
}

export interface IProductSearchFilters {
  culture?: string,
  query?: string,
  oFavorites?: boolean,
  oPromo?: boolean,
  oNew?: boolean,
  page?: number,
  perPage?: number,
  category?: number,
  department?: number
}
