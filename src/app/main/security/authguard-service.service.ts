import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AccessControlService } from './access-control.service';
import { AuthentificationService } from './authentification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthguardService implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthentificationService,
    private accessControlService: AccessControlService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isUserLoggedIn()) {
      if (this.accessControlService.canAccessRoute(state.url || route.routeConfig?.path || '')) {
        return true;
      }

      this.router.navigateByUrl(this.accessControlService.getDefaultRoute());
      return false;
    } else {
      this.router.navigate(['login'], {
        queryParams: { returnUrl: state.url || '/dashboard' },
      });
      return false;
    }
  }
}
