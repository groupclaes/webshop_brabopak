import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom, Observable, of, Subject } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'

const api_url = environment.sso.url
const client_id = environment.sso.client_id
const scope = environment.sso.scope

const SESSION_STORAGE_KEY = environment.storageKey + '.session'
const REFRESH_STORAGE_KEY = environment.storageKey + '.refresh_token'
const CUSTOMER_STORAGE_KEY = environment.storageKey + '.customer'
const CUSTOMERS_STORAGE_KEY = environment.storageKey + '.customers'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | undefined

  private _id_token: string | undefined
  private _access_token: string | undefined
  private _customer_cache: ICustomer[] = []

  change: Subject<IGetTokenResponse | undefined> = new Subject<IGetTokenResponse | undefined>()
  customerChange: Subject<void> = new Subject<void>()

  authenticating: boolean = false

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private localize: LocalizeRouterService,
    private http: HttpClient
  ) {
    this.change.subscribe(response => {
      if (response) {
        this._id_token = response.id_token
        this._access_token = response.access_token
      } else {
        this._id_token = undefined
        this._access_token = undefined
      }
    })

    if (window.sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      const response = JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) || '')
      this.change.next(response)
      setTimeout(() => {
        this.refresh()
      }, 100)
    }

    if (window.sessionStorage.getItem(CUSTOMERS_STORAGE_KEY)) {
      this._customer_cache = JSON.parse(window.sessionStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]')
    }

    // check each minute if session is still valid
    setInterval(() => {
      this.refresh()
    }, 60000)
  }

  public authorize(credentials: { username: string, password: string }, token?: string): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${api_url}authorize`, credentials, {
      params: {
        response_type: 'code',
        scope: scope,
        client_id: client_id
      },
      headers: token ? {
        'g-recaptcha-response': token
      } : {}
    }))
  }

  public signon(credentials: { username: string, password: string, code: string }): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${api_url}users/signon`, credentials))
  }

  public getToken(authorization_code: string) {
    const getTokenSub = this.http.get<IGetTokenResponse>(`${api_url}token`, {
      params: {
        grant_type: 'authorization_code',
        code: authorization_code
      }
    }).pipe(shareReplay())
    getTokenSub.subscribe(e => this.saveTokens(e))
    return getTokenSub
  }

  public refresh(): Observable<string | undefined> {
    if (!this.isAuthenticated() && this.refresh_token) {
      if (this.refresh_token === undefined) {
        console.warn('There is no refresh token defined!')
        return of(undefined)
      }

      const r = this.http.post<IGetTokenResponse>(`${api_url}users/refresh-token`, undefined, {
        params: {
          token: `${this.refresh_token}`
        }
      }).pipe(shareReplay())
      r.subscribe(resp => {
        const refresh_token = resp.refresh_token
        delete resp.refresh_token

        if (!refresh_token) return

        if (window.localStorage.getItem(REFRESH_STORAGE_KEY))
          window.localStorage.setItem(REFRESH_STORAGE_KEY, refresh_token)
        else
          window.sessionStorage.setItem(REFRESH_STORAGE_KEY, refresh_token)
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resp))
        this.change.next(resp)
      })
      return r.pipe<string | undefined>(map(resp => resp.refresh_token))
    }

    return of(undefined)
  }

  public logout() {
    this.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    this.sessionStorage.removeItem(REFRESH_STORAGE_KEY)
    this.sessionStorage.removeItem(CUSTOMERS_STORAGE_KEY)
    this.storage.removeItem(CUSTOMER_STORAGE_KEY)
    this.storage.removeItem(REFRESH_STORAGE_KEY)
    this.change.next(undefined)

    // this.router.navigate([this.localize.translateRoute('/auth/sign-in')])
  }

  public isAuthenticated(): boolean {
    if (this.id_token) {
      if (new Date(this.id_token.exp * 1000) > new Date()) {
        return true
      }
      // must renew the id_token because it's expired
    }
    return false
  }

  public isMultiUser(): boolean {
    if (this.id_token) {
      return this.id_token.user_type > 1
    }
    return false
  }

  public isAgent(): boolean {
    if (this.id_token) {
      return this.id_token.user_type === 2
    }
    return false
  }

  private saveTokens(tokens: IGetTokenResponse): void {
    const refresh_token = tokens.refresh_token
    delete tokens.refresh_token

    this.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokens))
    if (refresh_token)
      this.storage.setItem(REFRESH_STORAGE_KEY, refresh_token)
    this.change.next(tokens)
  }

  private async syncCustomers() {
    const result = await firstValueFrom(this.http.get<any[] | undefined>(`${api_url}users/customers`))
    if (result && result.length > 0) {
      this._customer_cache = result
      window.sessionStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(result))
      this.customerChange.next()
    }
  }

  get id_token(): IdToken | undefined {
    if (this._id_token)
      return JSON.parse(window.atob(this._id_token.split('.')[1]))
    return undefined
  }

  get username(): string {
    if (this.isAuthenticated() && this.id_token)
      return this.id_token.preferred_username
    return 'unknown'
  }

  get expired(): boolean {
    if (this.id_token)
      return new Date(this.id_token.exp * 1000) < new Date()
    return false
  }

  get refresh_token(): string | undefined {
    return this.sessionStorage.getItem(REFRESH_STORAGE_KEY) ?? this.storage.getItem(REFRESH_STORAGE_KEY) ?? undefined
  }

  get access_token(): string | undefined {
    return this._access_token
  }

  get storage(): Storage {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage
    } else {
      return {
        clear: () => undefined,
        getItem: (key) => null,
        length: 0,
        key: (index) => null,
        setItem: (key, value) => null,
        removeItem: (key) => null
      }
    }
  }

  get sessionStorage(): Storage {
    if (isPlatformBrowser(this.platformId)) {
      return window.sessionStorage
    } else {
      return {
        clear: () => undefined,
        getItem: (key) => null,
        length: 0,
        key: (index) => null,
        setItem: (key, value) => null,
        removeItem: (key) => null
      }
    }
  }

  get canViewPrices(): boolean {
    return this.isAuthenticated() && this.id_token !== undefined && ((this.id_token.user_type === 2 || this.id_token.user_type === 3) && this.currentCustomer !== undefined)
  }

  get customers(): ICustomer[] {
    if (this.isAuthenticated() && this.id_token) {
      switch (this.id_token.user_type) {
        case 1:
          return this.id_token.customers

        case 2:
        case 3:
        case 4:
          if (this._customer_cache.length === 0) this.syncCustomers()
          return this._customer_cache
      }
    }
    return []
  }

  set currentCustomer(customer: ICustomer | undefined) {
    if (!customer) {
      window.localStorage.removeItem(CUSTOMER_STORAGE_KEY)
      return
    }

    if (customer !== this.currentCustomer) {
      window.localStorage.setItem(CUSTOMER_STORAGE_KEY, `${customer.id}_${customer.address_id}`)
      this.customerChange.next()
    }
  }

  get currentCustomer(): ICustomer | undefined {
    if (this.isAuthenticated() && this.id_token) {
      switch (this.id_token.user_type) {
        case 1:
          return this.customers[0]

        case 2:
        case 3:
        case 4:
          const selectedCustomerKey = window.localStorage.getItem(CUSTOMER_STORAGE_KEY)
          if (selectedCustomerKey && this.customers.length > 0) {
            const customer_id = parseInt(selectedCustomerKey.split('_')[0], 10)
            const address_id = parseInt(selectedCustomerKey.split('_')[1], 10)
            const customer = this.customers.find(c => c.id === customer_id && c.address_id === address_id)

            if (!customer) {
              this.storage.removeItem(CUSTOMER_STORAGE_KEY)
              return undefined
            }

            return customer
          }
          return undefined
      }
    }
    return undefined
  }
}

export interface IGetTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  id_token: string
  refresh_token?: string
  id_token_jwt?: string
}

export interface IdToken {
  exp: number
  // iat: number
  aud: string[]
  iss: string
  sub: string
  name: string
  given_name: string
  surname: string
  email: string
  preferred_username: string

  usercode: number
  user_type: 1 | 2 | 3 | 4
  token: string

  customers: ICustomer[]

  picture: string
}

export interface ICustomer {
  id: number
  name: string
  address: string
  street_number: string
  city: string
  zip_code: string
  country: string

  address_id: number
  address_name: string
  address_address: string
  address_street_number: string
  address_city: string
  address_zip_code: string
  address_country: string

  usercode: number
}