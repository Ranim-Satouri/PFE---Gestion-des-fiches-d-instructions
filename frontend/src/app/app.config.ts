import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('AuthInterceptor - URL:', req.url, 'Token:', token);

  // Skip interceptor for public routes (e.g., login)
  if (req.url.includes('/api/v1/auth/authenticate')) {
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('AuthInterceptor - Authorization Header:', cloned.headers.get('Authorization'));
    return next(cloned);
  } else {
    console.warn('AuthInterceptor - No token found in localStorage');
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