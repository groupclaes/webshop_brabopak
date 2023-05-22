import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EcommerceApiService {
  constructor(
    private http: HttpClient
  ) { }

  get urls() {
    return {
      menu: () => `${environment.api}ecommerce/menu`
    }
  }

  menu(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.urls.menu()))
  }
}