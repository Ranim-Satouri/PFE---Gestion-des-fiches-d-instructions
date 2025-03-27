import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly storageKey = 'sidebarState';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  setSidebarState(isOpen: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(isOpen));
    }
  }

  getSidebarState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const savedState = localStorage.getItem(this.storageKey);
      return savedState !== null ? JSON.parse(savedState) : true;
    }
    return true; // Valeur par défaut si SSR
  }
}
