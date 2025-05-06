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
  // menus !:Menu[]

  constructor(private themeService: ThemeService, private router: Router,@Inject(PLATFORM_ID) private platformId: Object) {
    this.isDarkMode = this.themeService.isDarkMode();
    // try {
    //   this.isSideBarOpen = JSON.parse(localStorage.getItem('sidebarState') || 'true');
    // } catch (error) {
    //   // console.warn("Erreur lors de la récupération de sidebarState:", error);
    // }
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.currentUser = JSON.parse(localStorage.getItem('user')!);
        this.matricule = this.currentUser.matricule;
        this.email = this.currentUser.email;
        this.nom = this.currentUser.nom;
        //recuperer les permissions
        // const permissions = this.currentUser.groupe?.permissions || [];
        // const uniqueMenusMap = new Map<number, any>();
        // for (const permission of permissions) {
        //   const menu = permission.menu;
        //   if (menu && !uniqueMenusMap.has(menu.idMenu)) {
        //     uniqueMenusMap.set(menu.idMenu, menu);
        //   }
        // }
        // this.menus = Array.from(uniqueMenusMap.values());
        
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

    // Vérifiez si le clic est en dehors du bouton et du dropdown
    if (this.isListOpen && dropdown && !dropdown.contains(target) && !button) {
      this.isListOpen = false; // Ferme la liste
    }
  }
  getCurrentPath(): string {
    return this.router.url;
  }
  // hasMenu(menuName: string): boolean {
  //   console.log(this.menus.some(menu => menu.nom === menuName));
  //   return this.menus.some(menu => menu.nom === menuName);
  // }

  openProfileDialog(): void {
    if (this.profileDialog) {
      this.profileDialog.showProfileDialog(123); // 123 est l'ID de l'utilisateur
      this.isListOpen = false;
    }
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.currentUser.groupe?.permissions || []; 
    return permissions.some(permission => permission.nom === permissionName);  
  }
}
