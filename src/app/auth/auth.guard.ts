import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'


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
