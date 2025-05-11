import { HttpClient, HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { catchError, debounceTime, of, switchMap, throwError } from 'rxjs';
import { routes } from './app.routes';
import { loadingInterceptor } from './loading.interceptor';

let isRefreshing = false; // Verrou pour éviter plusieurs refresh simultanés
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const http = inject(HttpClient);
  const router = inject(Router);

  if (req.url.includes('/api/v1/auth') || req.url.includes('/api/v1/auth/refresh')) {
    return next(req.clone({ withCredentials: true }));
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned).pipe(
      debounceTime(1000), // Débouncer pour limiter les requêtes multiples
      catchError((err) => {
        if (err.status === 401) {
          console.log('401 Unauthorized - Attempting to refresh token');
          if (!isRefreshing) {
            isRefreshing = true;
            return http.post('http://localhost:8080/api/v1/auth/refresh', {}, { withCredentials: true }).pipe(
              debounceTime(1000), // Débouncer la requête de refresh
              switchMap((res: any) => {
                console.log('Token refreshed:', res);
                isRefreshing = false;
                localStorage.setItem('token', res.token);
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.token}` }
                });
                return next(retryReq);
              }),
              catchError((refreshErr) => {
                console.error('Refresh token failed:', refreshErr);
                isRefreshing = false;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.navigate(['/']); // Rediriger vers la page de login
                return throwError(() => refreshErr);
              })
            );
          } else {
            // Attendre que le refresh en cours soit terminé
            return of(null).pipe(
              debounceTime(1000),
              switchMap(() => {
                const newToken = localStorage.getItem('token');
                if (newToken) {
                  const retryReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                  });
                  return next(retryReq);
                } else {
                  router.navigate(['/']);
                  return throwError(() => err);
                }
              })
            );
          }
        } else if (err.status === 403) {
          console.error('403 Forbidden - Redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.navigate(['/']); // Rediriger vers la page de login
          return throwError(() => err);
        }
        return throwError(() => err);
      })
    );
  } else {
    console.warn('No access token found, proceeding without Authorization header');
    router.navigate(['/']); // Rediriger vers la page de login
    return throwError(() => new Error('No access token'));
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Add for change detection
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loadingInterceptor])),
    provideAnimationsAsync()
  ]
};