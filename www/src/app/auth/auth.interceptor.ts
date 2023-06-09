import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from 'rxjs'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AuthService } from './auth.service'

const API_URL = 'brabopak.com/api'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false
  private refreshTokenSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined)

  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes(API_URL)) {
      return next.handle(this.addAuthToken(request)).pipe(
        catchError((requestError: HttpErrorResponse) => {
          if (requestError && requestError.status === 401) {
            console.log('this.auth.expired', this.auth.expired)

            if (this.refreshTokenInProgress) {
              return this.refreshTokenSubject.pipe(
                filter((result) => result !== undefined),
                take(1),
                switchMap(() => next.handle(this.addAuthToken(request)))
              );
            } else /* if (this.auth.expired) */ {
              this.refreshTokenInProgress = true
              this.refreshTokenSubject.next(undefined)

              return this.auth.refresh().pipe(
                switchMap((token) => {
                  this.refreshTokenSubject.next(token)
                  return next.handle(this.addAuthToken(request))
                }),
                finalize(() => (this.refreshTokenInProgress = false))
              );
            }/* else {
              return NEVER
            } */
          } else {
            return throwError(() => requestError)
          }
        })
      )
    }
    return next.handle(request)
  }

  addAuthToken(request: HttpRequest<any>) {
    const token = this.auth.access_token

    //if (request.headers.has('Authorization')) {
    if (!token) {
      console.warn('There is no token, but this is required for this request to work!')
    }

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token ?? 'no token available'}`,
      }
    })
    //}

    return request
  }
}
