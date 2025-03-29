import { Component, HostListener, Input } from '@angular/core';
import { Role, User, UserStatus } from '../../models/User';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { RegisterFormComponent } from '../register-form/register-form.component';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, RegisterFormComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  showForm = false;

  showRegisterForm() {
    this.showForm = true;
  }

  hideRegisterForm() {
    this.showForm = false;
    console.log('Form closed');
  }
  onUserRegistered(newUser: any) {
    // Ajoutez le nouvel utilisateur à votre liste
    this.users.unshift(newUser);
    this.hideRegisterForm();
  }
constructor(private userService: UserService) {}
  users : any[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 8;
  Role !: Role;
  userConnected !: User;
  updatedRole !: Role
  updatedStatus !: UserStatus

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
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
      this.Role=this.userConnected.role;
    }
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
      this.updatedRole = Role.SUPERUSER
    }else{
      this.updatedRole = Role.ADMIN
    }

   this.userService.ChangeRole(user.idUser, this.userConnected.idUser || 1 , this.updatedRole).subscribe({
    next : (response :any[]) => {
      console.log('Role changed successuly  ');
    },
    error : (error : any) => {
      console.error('changing user Role error:', error);
    }
  });
}

onStatusToggleChange(user: any, event: any) {
    console.log("status", user.status);
    if(user.status === UserStatus.ACTIVE){
      this.updatedStatus = UserStatus.INACTIVE
    }else{
      this.updatedStatus = UserStatus.ACTIVE
    }
   this.userService.ChangeStatus(user.idUser,this.userConnected.idUser || 1, this.updatedStatus).subscribe({
      next : (response :any[]) => {
        console.log('Status changed successuly  ');
      },
      error : (error : any) => {
        console.error('changing user Status error:', error);
      }
    });
}

}
