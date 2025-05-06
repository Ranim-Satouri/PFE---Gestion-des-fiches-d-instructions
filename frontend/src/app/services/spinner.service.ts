import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private requestCount = 0;

  show() {
    this.requestCount++;
    if (this.requestCount > 0 && !this.loadingSubject.value) {
      this.loadingSubject.next(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0; // Éviter les nombres négatifs
      this.loadingSubject.next(false);
    }
  }
}
