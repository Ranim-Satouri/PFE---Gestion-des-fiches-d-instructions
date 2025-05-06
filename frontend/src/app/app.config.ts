import { HttpClient, HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { routes } from './app.routes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const http = inject(HttpClient);
  const router = inject(Router);
  console.log('AuthInterceptor - URL:', req.url, 'Token:', token);

  if (req.url.includes('/api/v1/auth') || req.url.includes('/api/v1/auth/refresh')) {
    return next(req.clone({ withCredentials: true }));
  }

  if (token) {
      const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(cloned).pipe(
          catchError((err) => {
              console.log('Interceptor caught error:', err);
              console.log('Error status:', err.status, 'Error message:', err.message);
              if (err.status === 401) {
                console.log('401 Unauthorized - Attempting to refresh token');
                return http.post('http://localhost:8080/api/v1/auth/refresh', {}, { withCredentials: true }).pipe(
                  switchMap((res: any) => {
                    console.log('Token refreshed:', res);
                    localStorage.setItem('token', res.token);
                    const retryReq = req.clone({
                      setHeaders: { Authorization: `Bearer ${res.token}` }
                    });
                    return next(retryReq);
                  }),
                  catchError((refreshErr) => {
                    console.error('Refresh token failed:', refreshErr);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.navigate(['/']);
                    return throwError(() => refreshErr);
                  })
                );
              } else if (err.status === 403) {
                console.error('403 Forbidden - Access denied');
                // router.navigate(['/access-denied']);
              }
              return throwError(() => err);
            })
          );
        } else {
          console.warn('No access token found, proceeding without Authorization header');
          return next(req);
        }
      };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Add for change detection
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimationsAsync()
  ]
};