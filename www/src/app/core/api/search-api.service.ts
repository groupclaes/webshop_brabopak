import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment'
import { IBaseApiResponse, trimParameters } from '.';

@Injectable({
  providedIn: 'root'
})
export class SearchApiService {
  constructor(
    private http: HttpClient
  ) { }

  get urls() {
    return {
      search: () => `${environment.api}search`,
    }
  }

  get(query: string, culture: string, category_id?: number): Promise<IBaseApiResponse> {
    const params = trimParameters({
      query,
      culture,
      category_id
    })
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.search(), { params }))
  }

  post(usercode?: number, filters?: IProductSearchFilters, ux?: string): Observable<IBaseApiResponse> {
    const params = trimParameters({
      usercode,
      culture: filters?.culture,
      ux
    })

    return this.http.post<IBaseApiResponse>(this.urls.search(), filters, {
      params
    })
  }
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