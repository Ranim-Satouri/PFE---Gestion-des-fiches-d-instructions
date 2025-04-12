import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { PermissionService } from '../../../services/permission.service';
import { Menu } from '../../../models/Menu';
import { Permission } from '../../../models/Permission';
import { Groupe } from '../../../models/Groupe';
import { GroupeService } from '../../../services/groupe.service';

@Component({
  selector: 'app-add-groupe',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './add-groupe.component.html',
  styleUrl: './add-groupe.component.css'
})
export class AddGroupeComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private userService:UserService, private menuService: MenuService,private permissionService: PermissionService, private groupeService: GroupeService) {}
  currentStep : number = 1;
  userConnected !: User;
  steps = ["Groupe", "Utilsateurs", "Menu","Permissions"];
  users: User[] = [];
  menus: Menu[] = [];
  permissions: Permission[] = [];
  userSearchText: string = '';
  permessionSearchText: string = '';
  showSelectorDropdown : Boolean = false;
  affectationFilter: string = ''; // '', 'assigned', 'not-assigned'
  selectedState: string = '';
  selectedUsers = new Set<number>();
  menuSearchText: string = '';
  groupeForm !: FormGroup;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.groupeForm =  new FormGroup({
      nom: new FormControl('', [Validators.required])
    });
    this.getUsers(); 
    this.getMenus();
    this.getPermissions();
    
  }
  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  // Fermer le formulaire
  closeForm() {
    this.close.emit();
  }
  // Méthode appelée lors de la soumission du formulaire
  onGroupNameSubmit(): void {
    if (this.groupeForm.valid) {
      const newGroupe: Groupe = {
        nom: this.groupeForm.value.nom,
        actionneur: this.userConnected
      };
        
      // this.groupeService.addGroupe(newGroupe, this.userConnected.idUser!).subscribe({
      //   next: (response) => {
            //this.goToNextStep();  // Passe à l'étape suivante si le nom est valide

      //   },
      //   error: (err) => {
          
      //   }
      // });
    } else {
      this.groupeForm.markAllAsTouched();
    }
  }
  // Méthode pour définir l'étape active
  setStep(step: number) {
    this.currentStep = step;
  }

  // Méthode pour passer à l'étape suivante
  goToNextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }
  getMenus(){
    // Récupérer tous les menus
    this.menuService.getAllMenus().subscribe((menus) => {
      this.menus = menus; 
      console.log(this.menus);

    },
    (error) => {
      console.error('Erreur lors de la récupération des permissions', error);
    });
  }
  getPermissions(){
    // Récupérer toutes les permissions
    this.permissionService.getAllPermissions().subscribe(
      (permissions) => {
        this.permissions = permissions; 
        console.log(this.permissions);

      },
      (error) => {
        console.error('Erreur lors de la récupération des permissions', error);
      }
    
    );
  }
  getUsers(){
    this.userService.getAll().subscribe(
      (data: User[]) => {
        this.users = data;  
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }
  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch =
        `${user.nom} ${user.prenom} ${user.matricule}`.toLowerCase().includes(this.userSearchText.toLowerCase());
  
    
      const isAssigned = this.selectedUsers.has(user.idUser!);
  
      const matchesAffectation = this.affectationFilter === 'Affectés'
        ? isAssigned
        : this.affectationFilter === 'Non affectés'
          ? !isAssigned
          : true;
  
      return matchesSearch  && matchesAffectation;
    });
  }
  get filteredPermissions(): Permission[] {
    return this.permissions.filter(permission => {
      const matchesSearch =
        `${permission.nom}`.toLowerCase().includes(this.permessionSearchText.toLowerCase());
  
    
      const isAssigned = this.selectedUsers.has(permission.idPermission!);
  
      const matchesAffectation = this.affectationFilter === 'Affectés'
        ? isAssigned
        : this.affectationFilter === 'Non affectés'
          ? !isAssigned
          : true;
  
      return matchesSearch  && matchesAffectation;
    });
  }
  get filteredMenus(): Menu[] {
    return this.menus.filter(menu => {
      const matchesSearch =
        `${menu.nom}`.toLowerCase().includes(this.menuSearchText.toLowerCase());
  
    
      const isAssigned = this.selectedUsers.has(menu.idMenu!);
  
      const matchesAffectation = this.affectationFilter === 'Affectés'
        ? isAssigned
        : this.affectationFilter === 'Non affectés'
          ? !isAssigned
          : true;
  
      return matchesSearch  && matchesAffectation;
    });
  }
  selectState(state: string) {
    this.selectedState = state;
    this.affectationFilter = state;
    this.showSelectorDropdown = false;
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
  
    const dropdown1 = document.getElementById(`dropdownAffectation`);
    const button1 = target.closest('Affectation-input');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showSelectorDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
      this.showSelectorDropdown = false; // Ferme le dropdown
    }
  }
}
