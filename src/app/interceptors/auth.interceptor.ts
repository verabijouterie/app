import { HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, from, of, switchMap, throwError, Observable } from 'rxjs';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';

const authChannel = new BroadcastChannel('auth');

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  // Attach token if available
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
      if (error.status === 401) {
        const now = Date.now();
        const lockKey = 'refresh_in_progress_at';
        const lastRefresh = parseInt(localStorage.getItem(lockKey) || '0', 10);
        const safeWindow = 10000; // 10 seconds

        if (now - lastRefresh < safeWindow) {
          // Another tab is already refreshing — wait and retry
          return from(
            new Promise<void>((resolve) => {
              const wait = setInterval(() => {
                const updatedToken = authService.token;
                if (updatedToken) {
                  clearInterval(wait);
                  resolve();
                }
              }, 500);
            })
          ).pipe(
            switchMap(() => {
              const updatedToken = authService.token;
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${updatedToken}`
                }
              });
              return next(retryReq);
            })
          );
        }

        // This tab will refresh
        localStorage.setItem(lockKey, now.toString());

        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.token;
            if (!newToken) {
              authService.logout();
              router.navigate(['/signup']);
              return throwError(() => error);
            }

            // ✅ Broadcast to other tabs
            authChannel.postMessage({ type: 'NEW_TOKEN', token: newToken });

            // ✅ Retry original request
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

      return throwError(() => error);
    })
  );
};

// ✅ Listen for token updates from other tabs
authChannel.onmessage = (event) => {
  if (event.data.type === 'NEW_TOKEN') {
    localStorage.setItem('token', event.data.token);
  }
};
