import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AuthService } from './auth.service'

const client_id = environment.sso.client_id
const scope = environment.sso.scope

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (route.queryParams['authorization_code']) {
      try {
        const token = await firstValueFrom(this.auth.getToken(route.queryParams['authorization_code']))
        if (token) {
          this.router.navigate([], {
            queryParams: {
              authorization_code: null
            },
            queryParamsHandling: 'merge'
          })
          return true
        }
      } catch {
        this.login()
      }
    }

    if (this.auth.isAuthenticated()) {
      return true
    }

    if (await this.auth.refresh()) {
      return true
    }

    this.login()
    return false
  }

  login() {
    window.location.href = `https://login.foodpartners-international.com?client_id=${client_id}&scope=${scope}&redirect_url=https%3A%2F%2F${location.hostname}${encodeURIComponent(location.pathname)}%3Fauthorization_code%3D`
  }
}
