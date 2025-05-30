import { Component, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild  } from '@angular/core';
import { ThemeService } from '../config/theme.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Menu } from '../models/Menu';
import { ProfilComponent } from '../components/profil/profil.component';
import { User } from '../models/User';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfilComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  @ViewChild('profileDialog') profileDialog!: ProfilComponent;
  isDarkMode: boolean;
  isSideBarOpen : boolean = JSON.parse(localStorage.getItem('sidebarState') || 'true');
  isSideBarHidden : boolean =true;
  isListOpen : Boolean = false;
  isPopUpOpen: boolean = false;
  currentUser!: User;
  matricule: string = '';
  email: string = '';
  nom: string = '';
  

  constructor(private themeService: ThemeService, private router: Router,@Inject(PLATFORM_ID) private platformId: Object) {
    this.isDarkMode = this.themeService.isDarkMode();
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.currentUser = JSON.parse(localStorage.getItem('user')!);
        this.matricule = this.currentUser.matricule;
        this.email = this.currentUser.email;
        this.nom = this.currentUser.nom;
      } catch (error) {
        // console.warn("Erreur lors de la récupération de sidebarState:", error);
      }  
    }
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('groupe');
    localStorage.removeItem('groupeNom');
    localStorage.removeItem('selectedSidebarItem');
    this.router.navigate(['/']);
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
    if (this.isListOpen && dropdown && !dropdown.contains(target) && !button) {
      this.isListOpen = false; 
    }
  }
  getCurrentPath(): string {
    return this.router.url;
  }

  openProfileDialog(): void {
    if (this.profileDialog) {
      this.profileDialog.showProfileDialog(1); 
      this.isListOpen = false;
    }
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.currentUser.groupe?.permissions || []; 
    return permissions.some(permission => permission.nom === permissionName);  
  }
}
