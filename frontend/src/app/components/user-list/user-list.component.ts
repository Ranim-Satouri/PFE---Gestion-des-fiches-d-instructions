import { Component, HostListener, Input } from '@angular/core';
import { Role, User, UserStatus } from '../../models/User';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
constructor(private userService: UserService) {} 
  users : any[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 8;
  Role : Role = Role.SUPERUSER; // baddika njibouh mel local storage

  toggleDropdown(index: number): void {
    // Si le menu est déjà ouvert pour cette ligne, on le ferme
    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      // Sinon, on ouvre le menu pour cette ligne
      this.dropdownOpen = index;
    }
  }

  ngOnInit() { 
    this.getFiches();
  }

  getFiches() { 
    this.userService.getAll().subscribe({
      next : (response :User[]) => {         
        this.users = response;
      },
      error : (error : any) => {  
        console.error('fetching users error:', error);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropdownDots-${this.dropdownOpen}`);
    const button = target.closest('button[data-dropdown-toggle]');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.dropdownOpen !== null && dropdown && !dropdown.contains(target) && !button) {
      this.dropdownOpen = null; // Ferme le dropdown
    }
  }

  shouldDisplayAbove(index: number): boolean {
    const dropdown = document.getElementById(`dropdownDots-${index}`);
    if (dropdown) {
      const rect = dropdown.getBoundingClientRect();
      return rect.bottom > window.innerHeight; // Vérifie si le dropdown dépasse la fenêtre
    }
    return false;
  }

  onRoleToggleChange(user: any, event: any) {
    console.log("ken",user.role);
    if(user.role === Role.ADMIN){
      console.log("walla" , "SUPERUSER")
    }
    if(user.role === Role.SUPERUSER){
      console.log("walla" , "ADMIN")
    }
    const updatedRole = event.target.checked ? 'SUPERUSER' : 'ADMIN';  // Exemple : changer le rôle basé sur l'état du toggle
    // Envoyer la requête pour mettre à jour le rôle de l'utilisateur
   // this.userService.updateUserRole(user.id, updatedRole).subscribe();
}

onStatusToggleChange(user: any, event: any) {
  console.log("status", user.status);
    if(user.status === UserStatus.ACTIVE){
      console.log("walla" , "INACTIVE")
    }else{
      console.log("walla" , "ACTIVE")
    }
    const updatedStatus = event.target.checked ? 'ACTIVE' : 'INACTIVE';  // Exemple : changer le statut basé sur l'état du toggle
    // Envoyer la requête pour mettre à jour le statut de l'utilisateur
   // this.userService.updateUserStatus(user.id, updatedStatus).subscribe();
}

}
