import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  // Clone request to add access token if it exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized, try refreshing once
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.token;
            if (!newToken) {
              authService.logout();
              router.navigate(['/signup']);
              return throwError(() => error);
            }

            // Retry the original request with the new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            router.navigate(['/signup']);
            return throwError(() => error);
          })
        );
      }

      // Any other error
      return throwError(() => error);
    })
  );
};
