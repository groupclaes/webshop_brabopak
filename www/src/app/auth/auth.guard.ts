import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
// import { environment } from 'src/environments/environment'
import { AuthService } from './auth.service'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'

// const client_id = environment.sso.client_id
// const scope = environment.sso.scope

export const authGuard = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const localize = inject(LocalizeRouterService)


  if (route.queryParams['authorization_code']) {
    try {
      const token = await firstValueFrom(auth.getToken(route.queryParams['authorization_code']))
      if (token) {
        router.navigate([], {
          queryParams: {
            authorization_code: null
          },
          queryParamsHandling: 'merge'
        })
        return true
      }
    } catch {
      router.navigate([localize.translateRoute('/auth/sign-in')])
    }
  }

  if (auth.isAuthenticated()) {
    return true
  }

  if (await firstValueFrom(auth.refresh())) {
    return true
  }

  router.navigate([localize.translateRoute('/auth/sign-in')])
  return false
}

// const login = () => {
//   window.location.href = `https://login.foodpartners-international.com?client_id=${client_id}&scope=${scope}&redirect_url=https%3A%2F%2F${location.hostname}${encodeURIComponent(location.pathname)}%3Fauthorization_code%3D`
// }
