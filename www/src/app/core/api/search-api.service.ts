import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment'
import { trimParameters } from '.';

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

  get(query: string, culture: string, category_id?: number): Promise<any> {
    const params = trimParameters({
      query,
      culture,
      category_id
    })
    return firstValueFrom(this.http.get<any>(this.urls.search(), { params }))
  }

  post(usercode?: number, filters?: IProductSearchFilters, ux?: string): Observable<any> {
    const params = trimParameters({
      usercode,
      culture: filters?.culture,
      ux
    })

    return this.http.post(this.urls.search(), filters, {
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