import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { UserZoneService } from '../../services/user-zone.service';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-user-zone-assign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-zone-assign.component.html',
  styleUrl: './user-zone-assign.component.css'

})
export class UserZoneAssignComponent {
  constructor(private userService: UserService , private userZoneService: UserZoneService) {}
  successMessage: string = '';
  users: User[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<User[]>();
  @Input() idZone !: number ;
  searchText: string = '';
  selectedRole: string = '';
  userConnected !: User;
  roles = [ 'superuser', 'admin','preparateur','ipdf', 'iqp','operateur'];
  showRoleDropdown: boolean = false;
  affectationFilter: string = ''; // '', 'assigned', 'not-assigned'
  showSelectorDropdown: boolean = false;
  originalAssignedUsers = new Set<number>(); // contient les idUser au début (avant modif)
  selectedUsers = new Set<number>(); // modifiable par checkboxes
  selectedState: string = '';

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
  
    forkJoin({
      allUsers: this.userService.getAll(),
      assignedUserZones: this.userZoneService.getZoneUsers(this.idZone)
    }).subscribe({
      next: ({ allUsers, assignedUserZones }) => {
        this.users = allUsers;
  
        const assignedIds = assignedUserZones.map(uz => uz.user.idUser);
  
        this.originalAssignedUsers = new Set(assignedIds.filter((id): id is number => id !== undefined));
        this.selectedUsers = new Set(assignedIds.filter((id): id is number => id !== undefined)); // cocher ceux déjà affectés
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }
  

  toggleUser(user: User) {
    if (this.selectedUsers.has(user.idUser!)) {
      this.selectedUsers.delete(user.idUser!);
    } else {
      this.selectedUsers.add(user.idUser!);
    }
  }

  isChecked(user: User): boolean {
    return this.selectedUsers.has(user.idUser!);
  }

  
  
  selectRole(role: string) {
    this.selectedRole = role;
    this.showRoleDropdown = false;
  }
  selectState(state: string) {
    this.selectedState = state;
    this.affectationFilter = state;
    this.showSelectorDropdown = false;
  }
  
  clearRoleFilter() {
    this.selectedRole = '';
    this.showRoleDropdown = false;
  }
  

  handleSave() {
    if (!this.idZone) {
      console.error('❌ idZone est undefined ! Impossible d’envoyer les données.');
      return;
    }
    const idZone = this.idZone;
    const idActionneur = this.userConnected.idUser!;
  
    const addedUsers = Array.from(this.selectedUsers).filter(id => !this.originalAssignedUsers.has(id));
    const removedUsers = Array.from(this.originalAssignedUsers).filter(id => !this.selectedUsers.has(id));
  
    const addRequests = addedUsers.map(idUser =>
      this.userZoneService.attribuerZoneAUser(idUser, idZone, idActionneur)
    );
  
    const removeRequests = removedUsers.map(idUser =>
      this.userZoneService.retirerZoneAUser(idUser, idZone, idActionneur) // à créer côté backend
    );
  
    const allRequests = [...addRequests, ...removeRequests];
  
    Promise.all(allRequests.map(req => req.toPromise()))
      .then(() => {
        console.log('✅ Modifications enregistrées');
        this.save.emit(this.users.filter(u => this.selectedUsers.has(u.idUser!)));
        this.successMessage = `Les modifications ont bien été enregistrées !`;
        setTimeout(() => {
          this.successMessage = '';
          this.close.emit();
        }, 3000);
        
      })
      .catch(error => {
        console.error('❌ Une erreur est survenue lors de l’enregistrement', error);
      });
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch =
        `${user.nom} ${user.prenom} ${user.matricule}`.toLowerCase().includes(this.searchText.toLowerCase());
  
      const matchesRole = this.selectedRole
        ? user.role.toLowerCase() === this.selectedRole.toLowerCase()
        : true;
  
      const isAssigned = this.selectedUsers.has(user.idUser!);
  
      const matchesAffectation = this.affectationFilter === 'Affectés'
        ? isAssigned
        : this.affectationFilter === 'Non affectés'
          ? !isAssigned
          : true;
  
      return matchesSearch && matchesRole && matchesAffectation;
    });
  }


   @HostListener('document:click', ['$event'])
      closeDropdown(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const dropdown = document.getElementById(`dropdownRole`);
        const button = target.closest('Role-input');
    
        // Vérifiez si le clic est en dehors du dropdown et du bouton
        if (this.showRoleDropdown  && dropdown && !dropdown.contains(target) && !button) {
          this.showRoleDropdown = false; 
        }// Ferme le dropdown
        const dropdown1 = document.getElementById(`dropdownAffectation`);
        const button1 = target.closest('Affectation-input');
    
        // Vérifiez si le clic est en dehors du dropdown et du bouton
        if (this.showSelectorDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
          this.showSelectorDropdown = false; // Ferme le dropdown
        }
    }

}
