import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { SpinnerService } from './services/spinner.service';

export const loadingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(SpinnerService);
  //console.log('LoadingInterceptor - Début requête:', req.url);

  // Ignorer certaines requêtes (ex: refresh token)
  if (req.url.includes('/api/v1/auth/refresh')) {
    return next(req);
  }

  loadingService.show();
  return next(req).pipe(
    finalize(() => {
      //console.log('LoadingInterceptor - Fin requête:', req.url);
      loadingService.hide();
    })
  );
};
// Injection : Utilise inject(LoadingService) pour accéder au service.
// show/hide : Appelle show() avant la requête et hide() après (succès ou erreur) via finalize.
// Exclusion : Ignore /api/v1/auth/refresh pour éviter des flashs du spinner lors du rafraîchissement du token.
