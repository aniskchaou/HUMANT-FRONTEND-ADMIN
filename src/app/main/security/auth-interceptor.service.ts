import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthentificationService } from './authentification.service';

/**
 * Automatically attaches Authorization and X-Tenant-Code headers to every
 * outgoing HTTP request so that components using raw HttpClient (candidate,
 * interview, pipeline, offer-letter) work correctly without manual header setup.
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authentificationService: AuthentificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authorization = this.authentificationService.getStoredAuthorization();
    const tenantCode = this.authentificationService.getStoredTenantCode();

    if (!authorization) {
      return next.handle(request);
    }

    const headers: Record<string, string> = {
      Authorization: authorization,
    };

    if (tenantCode) {
      headers['X-Tenant-Code'] = tenantCode;
    }

    const cloned = request.clone({ setHeaders: headers });
    return next.handle(cloned);
  }
}
