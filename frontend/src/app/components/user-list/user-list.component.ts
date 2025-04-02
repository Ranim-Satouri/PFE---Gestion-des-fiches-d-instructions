import { Component, HostListener, Input } from '@angular/core';
import { Role, User, UserStatus } from '../../models/User';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { User_Zone } from '../../models/User_Zone';
import { UserZoneService } from '../../services/user-zone.service';
import { forkJoin, map } from 'rxjs';
import { DeleteConfirmComponent } from "../delete-confirm/delete-confirm.component";

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, RegisterFormComponent, DeleteConfirmComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
constructor(private userService: UserService , private userZoneService: UserZoneService) {}
  users : any[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  Role !: Role;
  userConnected !: User;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  UserStatus = UserStatus;
  isDeleteModelOpen : boolean = false;
  selectedUser : number | undefined;

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
      this.Role=this.userConnected.role;
    }
    this.getUsers();
  }
  getUsers() {
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users; // Stocker les utilisateurs temporairement

        // Créer un tableau d'observables pour récupérer les zones de chaque utilisateur
        const zoneRequests = users.map(user =>
          this.userZoneService.getUserZones(user.idUser).pipe(
            // Assigner les zones à l'utilisateur correspondant
            map((zones: User_Zone[]) => {
              user.zones = zones.map(uz => uz.zone);
              return user;
            })
          )
        );

        // Exécuter toutes les requêtes en parallèle et mettre à jour this.users une fois terminé
        forkJoin(zoneRequests).subscribe({
          next: (updatedUsers: User[]) => {
            this.users = updatedUsers; // Mettre à jour la liste avec les zones chargées
            console.log(this.users);
          },
          error: (error: any) => {
            console.error('Fetching user zones error:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Fetching users error:', error);
      }
    });
  }
  getZoneNames(user: User): string {
    if (user.zones && user.zones.length > 0) {
      return user.zones.map(zone => zone.nom).join(', ');
    }
    return '-'; // Default message if no zones
  }

  onRoleToggleChange(user: User, event: any) {
    console.log("ken",user.role);

    if(user.role === Role.ADMIN){
      user.role = Role.SUPERUSER;
    }else{
      user.role = Role.ADMIN;
    }

    this.userService.ChangeRole(user.idUser || undefined , this.userConnected.idUser || undefined , user.role).subscribe({
      next : (response :any[]) => {
        console.log('Role changed successuly  ');
      },
      error : (error : any) => {
        console.error('changing user Role error:', error);
      }
    });
  }

  onStatusToggleChange(user: User, event: any) {
      console.log("status", user.status);
      if(user.status === UserStatus.ACTIVE){
        user.status = UserStatus.INACTIVE
      }else{
        user.status = UserStatus.ACTIVE
      }
     this.ChangeUserStatus(user.idUser,user.status)
  }
  openDeleteModel(user : User){
      this.selectedUser = user.idUser  ;
      this.dropdownOpen = null;
      this.isDeleteModelOpen = true;
    }
  closeDeleteModel(){
    this.selectedUser = undefined;
    this.isDeleteModelOpen = false;

  }
  ChangeUserStatus(idUser : number | undefined , status : UserStatus){
    this.userService.ChangeStatus(idUser , this.userConnected.idUser , status).subscribe({
      next : (response :any[]) => {
        console.log('Status changed successuly  ');
        this.getUsers();
      },
      error : (error : any) => {
        console.error('changing user Status error:', error);
      }
    });
    if(this.isDeleteModelOpen){
      this.closeDeleteModel();
    }
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        const spaceBelow = window.innerHeight - rect.bottom + 50;   // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

        this.displayAbove = spaceBelow < dropdownHeight;

        this.dropdownPosition = {
          top: this.displayAbove
            ? rect.top + window.scrollY - dropdownHeight + 25
            : rect.bottom + window.scrollY - 25,
          left: rect.left + window.scrollX - 190 + (button?.offsetWidth || 0),
        };
      }
      this.dropdownOpen = index;
    }
  }


  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.dropdownOpen !== null) {
      this.dropdownOpen = null;
    }
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

}
