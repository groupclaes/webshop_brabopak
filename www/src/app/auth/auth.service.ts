import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { firstValueFrom, Subject } from 'rxjs'
import { shareReplay } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { isPlatformBrowser } from '@angular/common'

const api_url = environment.sso.url
const client_id = environment.sso.client_id
const scope = environment.sso.scope

const SESSION_STORAGE_KEY = environment.storageKey + '.session'
const REFRESH_STORAGE_KEY = environment.storageKey + '.refresh_token'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | undefined

  private _id_token: string | undefined
  private _access_token: string | undefined

  change: Subject<IGetTokenResponse | undefined> = new Subject<IGetTokenResponse | undefined>()

  authenticating: boolean = false

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient
  ) {
    if (!environment.production) {
      this.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        access_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkY0WGFRRUdGS3U2Zk8xWTFJa282TW5WOTY4R3lVVWxUWlRNY0dhTjdOZEUiLCJqa3UiOiJodHRwczovL3Nzby5ncm91cGNsYWVzLmJlL3YxLy53ZWxsLWtub3duL2p3a3MuanNvbiJ9.eyJyb2xlcyI6WyJhZG1pbjpHcm91cENsYWVzLlBDTS8qIl0sImlzcyI6Imh0dHBzOi8vc3NvLmdvdXBjbGFlcy5iZSIsImF1ZCI6WyJPSGxjQzd2YzJoRXpOViIsImh0dHBzOi8vcGNtLmdyb3VwY2xhZXMuYmUvdWkiXSwiZXhwIjoxNjc4MTE1OTcyLCJzdWIiOiIxIn0.BQmqBp_6L_X8CepmwMt6Or7ghI5GSmAeUWPe98urEXIDk3Zqsu786JpwsqusiecWa0OYFmDOLq2Sr3-S-Q9MEj7c3zUZGLgoL2epRfSaCIhr4LVwjBNe5IR7o3coaBcsPFIF5eFyylXBOc_absvMsUQV0BzylHBkJuVCffQIju_RnDHrFWewnOk3PSZRplrBliQL3apZlAiIzRTLbMDLUo1gkBsB7qP7Zrsv-o_ktRtWNz-uH86MaN5YQp9XLJKHDplXBvLUb9HpWn1So6s8YzkWAO8_XF4k-AwZsGwkJuCwAiEgfBZZID_zfX8y8knslzQbV1l_wJ0UWHIQu2p1Gg',
        id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkY0WGFRRUdGS3U2Zk8xWTFJa282TW5WOTY4R3lVVWxUWlRNY0dhTjdOZEUiLCJqa3UiOiJodHRwczovL3Nzby5ncm91cGNsYWVzLmJlL3YxLy53ZWxsLWtub3duL2p3a3MuanNvbiJ9.eyJyb2xlcyI6WyJhZG1pbjpHcm91cENsYWVzLlBDTS8qIl0sImlzcyI6Imh0dHBzOi8vc3NvLmdvdXBjbGFlcy5iZSIsImF1ZCI6WyJPSGxjQzd2YzJoRXpOViIsImh0dHBzOi8vcGNtLmdyb3VwY2xhZXMuYmUvdWkiXSwiZXhwIjoxNjc4MTE1OTcyLCJzdWIiOiIxIn0.BQmqBp_6L_X8CepmwMt6Or7ghI5GSmAeUWPe98urEXIDk3Zqsu786JpwsqusiecWa0OYFmDOLq2Sr3-S-Q9MEj7c3zUZGLgoL2epRfSaCIhr4LVwjBNe5IR7o3coaBcsPFIF5eFyylXBOc_absvMsUQV0BzylHBkJuVCffQIju_RnDHrFWewnOk3PSZRplrBliQL3apZlAiIzRTLbMDLUo1gkBsB7qP7Zrsv-o_ktRtWNz-uH86MaN5YQp9XLJKHDplXBvLUb9HpWn1So6s8YzkWAO8_XF4k-AwZsGwkJuCwAiEgfBZZID_zfX8y8knslzQbV1l_wJ0UWHIQu2p1Gg'
      }))
    }

    this.change.subscribe(response => {
      if (response) {
        this._id_token = response.id_token
        this._access_token = response.access_token
      } else {
        this._id_token = undefined
        this._access_token = undefined
      }
    })

    const old_session = this.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (old_session) {
      const response = JSON.parse(old_session)
      this.change.next(response)
    }
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

  public async refresh(): Promise<boolean> {
    const old_session = this.sessionStorage.getItem(SESSION_STORAGE_KEY)
    // check if there is a session and check if the refreshToken is still valid

    if (!this.isAuthenticated()) {
      if (old_session) {
        const response = JSON.parse(old_session)
        if (new Date(response.id_token.exp * 1000) >= new Date()) {
          return true
        }
      }
      if (this.refresh_token && !this.authenticating) {
        // try to renew token
        try {
          this.authenticating = true
          const resp = await firstValueFrom(this.http.post<IGetTokenResponse>(`${api_url}users/refresh-token`, undefined, {
            params: {
              token: this.refresh_token
            }
          }))
          this.saveTokens(resp)
          return true
        } catch (err) {
          if (err instanceof HttpErrorResponse) {
            console.log(JSON.stringify(err))
            if (err.status === 403) {
              this.logout()
            }
          }
        } finally {
          this.authenticating = false
        }
      } else if (this.authenticating) {
        // If the user is already waiting for a new token, dont resend request but await the current one
        return await new Promise((resolve) => {
          setInterval(() => {
            if (!this.authenticating) {
              resolve(this.isAuthenticated())
            }
          }, 18)
        })
      }
    } else if (this.isAuthenticated()) {
      return true
    }
    return false
  }

  public logout() {
    this.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    this.sessionStorage.removeItem(REFRESH_STORAGE_KEY)
    this.storage.removeItem(REFRESH_STORAGE_KEY)
    this.change.next(undefined)
    if (window)
      window.location.href = `https://login.groupclaes.be?client_id=${client_id}&scope=${scope}&redirect_url=https%3A%2F%2F${location.hostname}${encodeURIComponent(location.pathname)}%3Fauthorization_code%3D`
  }

  public isAuthenticated(): boolean {
    if (this.id_token) {
      if (new Date(this.id_token.exp * 1000) > new Date() || this.refresh_token) {
        return true
      }
    }

    return false
  }

  async validate(): Promise<boolean> {
    if (this.id_token) {
      return new Date(this.id_token.exp * 1000) > new Date() ? true : await this.refresh()
    }

    return false
  }

  saveTokens(tokens: IGetTokenResponse): void {
    const refresh_token = tokens.refresh_token
    delete tokens.refresh_token

    this.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokens))
    if (refresh_token)
      this.storage.setItem(REFRESH_STORAGE_KEY, refresh_token)
    this.change.next(tokens)
  }

  get id_token(): IdToken | undefined {
    return {
      "name": "Jamie Vangeysel",
      "given_name": "Jamie",
      "surname": "Vangeysel",
      "preferred_username": "vangeyja",
      "email": "jamie.vangeysel@groupclaes.be",
      "picture": "https://www.gravatar.com/avatar/6ddd5b2d3650d9a76c66c631ea4dd4f2?r=pg&d=mp",
      "iss": "https://login.foodpartners-international.com",
      token: 'b52bc309-dea2-4e94-8a98-0785c206f56f',
      usercode: 9000003,
      usertype: 1,
      "aud": [
        "OHlcC7vc2hEzNV"
      ],
      "exp": 16078115972,
      "sub": "1"
    }
  }

  get username(): string {
    if (this.isAuthenticated() && this.id_token)
      return this.id_token.preferred_username
    return 'unknown'
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
  usertype: 1 | 2 | 3 | 4
  token: string

  picture: string
}
