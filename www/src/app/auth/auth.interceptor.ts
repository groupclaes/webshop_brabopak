import { from, Observable, switchMap } from 'rxjs'
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AuthService } from './auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (
      request.url.indexOf('brabopak.com/api') !== -1 ||
      request.url.indexOf('localhost') !== -1
    ) {
      return from(this.auth.validate()).pipe(switchMap((ok: boolean) => {
        if (this.auth.access_token && ok) {
          request = request.clone({
            setHeaders: { 'Authorization': 'Bearer ' + this.auth.access_token }
          })
        }
        return next.handle(request)
      }))
    }

    return next.handle(request)
  }
}
