import { Component, HostListener, OnInit  } from '@angular/core';
import { ThemeService } from '../config/theme.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../models/User';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isDarkMode: boolean;
  isSideBarOpen : boolean = true;
  isSideBarHidden : boolean =true;
  isListOpen : Boolean = false;
  selectedItem: string =localStorage.getItem('selectedSidebarItem') || '';;
  isPopUpOpen: boolean = false;
 
  setActive(item: string) {
    this.selectedItem = item;
    localStorage.setItem('selectedSidebarItem', item);
  }

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkMode();
    try {
      this.isSideBarOpen = JSON.parse(localStorage.getItem('sidebarState') || 'true');
    } catch (error) {
      // console.warn("Erreur lors de la récupération de sidebarState:", error);
    }
  }
  currentUser!: User;
  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
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
