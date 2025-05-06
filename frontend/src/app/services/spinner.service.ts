import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private requestCount = 0;

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      console.log('LoadingService: Afficher le spinner');
      this.isLoadingSubject.next(true);
    }
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      console.log('LoadingService: Masquer le spinner');
      this.isLoadingSubject.next(false);
    }
  }
}
// BehaviorSubject : Stocke l’état actuel du spinner (true = affiché, false = masqué).
// isLoading$ : Observable pour que les composants puissent s’abonner à l’état.
// requestCount : Gère les requêtes simultanées. Le spinner s’affiche à la première requête et se masque seulement quand toutes les requêtes sont terminées.
// Logs : Aide à déboguer l’affichage/masquage.