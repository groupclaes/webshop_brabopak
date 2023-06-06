import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment.prod'

@Injectable({
  providedIn: 'root'
})
export class CustomersApiService {
  constructor(
    private http: HttpClient
  ) { }

  get urls() {
    return {
      get: () => `${environment.api}customers`,
    }
  }

  get(id: number, addressId: number) {
    return firstValueFrom(this.http.get(this.urls.get(), { params: { id, addressId } }))
  }
}
