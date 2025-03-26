import { Component, HostListener } from '@angular/core';
import { ThemeService } from '../config/theme.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isDarkMode: boolean;
  isSideBarOpen : boolean = JSON.parse(localStorage.getItem('sidebarState') || 'true'); 
  isSideBarHidden : boolean =true;
  isListOpen : Boolean = false;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkMode();
  }
 
  openList() {
    this.isListOpen = !this.isListOpen;
  }
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
    this.isDarkMode = this.themeService.isDarkMode();
  }
  
  toggleSidebar() {
    this.isSideBarOpen = !this.isSideBarOpen;
    this.isSideBarHidden = true;
    localStorage.setItem('sidebarState', JSON.stringify(this.isSideBarOpen));
  }

  showSidebar() {
    this.isSideBarOpen = true;
    this.isSideBarHidden = !this.isSideBarHidden;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('dropdown-user');
    const button = target.closest('button');

    // Vérifiez si le clic est en dehors du bouton et du dropdown
    if (this.isListOpen && dropdown && !dropdown.contains(target) && !button) {
      this.isListOpen = false; // Ferme la liste
    }
  }
}
