import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'theme';

  constructor() {
    this.loadTheme();
     this.applyTheme();
  }
  private applyTheme(): void {
    const isDark = this.isDarkMode();
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  toggleDarkMode(): void {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      const isDarkMode = document.documentElement.classList.contains('dark');
      localStorage.setItem(this.themeKey, isDarkMode ? 'dark' : 'light');
    }
  }

  isDarkMode(): boolean {
    return typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  }

  loadTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(this.themeKey);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}