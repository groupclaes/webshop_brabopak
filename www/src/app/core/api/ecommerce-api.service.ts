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
      menu: () => `${environment.api}ecommerce/menu`,
      dashboard: () => `${environment.api}ecommerce/dashboard`
    }
  }

  menu(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.urls.menu()))
  }

  dashboard(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.urls.dashboard()))
  }
}