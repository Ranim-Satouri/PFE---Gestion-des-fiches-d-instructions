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
  menuSearchText: string = '';
  groupeForm !: FormGroup;
  selectedUsers = new Set<number>();
  selectedMenus = new Set<number>();
  selectedPermissions = new Set<number>();
  @Input() groupe !: Groupe ;
  isNewGroup: boolean = true;
  successMessage: string = '';
  errorMessage = '';
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getUsers(); 
    this.getMenus();
    this.getPermissions();
    if (this.groupe && this.groupe.idGroupe) {
      this.isNewGroup = false;
      this.groupeForm = new FormGroup({
        nom: new FormControl(this.groupe.nom, [Validators.required])
      });
      this.selectedMenus = new Set(this.groupe.menus?.map(menu => menu.idMenu!));
      this.selectedPermissions = new Set(this.groupe.permissions?.map(permission => permission.idPermission!));

    } else {
      // Initialize form for new group
      this.groupeForm = new FormGroup({
        nom: new FormControl('', [Validators.required])
      });
    }
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
  onGroupNameSubmit(buttonType: string): void {
    if (this.groupeForm.valid) {
      const newGroupe: Groupe = {
        nom: this.groupeForm.value.nom,
        actionneur: this.userConnected
      };
        
      this.groupeService.addGroupe(newGroupe, this.userConnected.idUser!).subscribe({
        next: (response) => {
            console.log(response); 
            this.groupe = response; 
            this.isNewGroup = false;
            this.errorMessage = '';
           
            if (buttonType === 'create') {
              // this.successMessage = `Groupe "${response.nom}" ajoutée avec succès !`;
    
              // setTimeout(() => {
                this.closeForm();
              //   this.successMessage = '';
              // }, 2000);
            } else if (buttonType === 'createAndAssign') {
              this.goToNextStep();
            }
      },
        error: (err) => {
          this.successMessage = '';
          console.error('Erreur lors de l’ajout :', err);
  
          if (err.status === 404) {
            this.errorMessage = "Actionneur introuvable";
          } else if (err.status === 409) {
            this.errorMessage = "Un groupe avec ce nom existe déjà.";
          } else {
            this.errorMessage = "Une erreur inattendue est survenue.";
          }
  
          setTimeout(() => {
            this.errorMessage = '';
          }, 2000);
        }
      });
    } else {
      this.groupeForm.markAllAsTouched();
    }
    
  }
  onGroupNameUpdate(buttonType: string): void {
    if (this.groupeForm.valid) {
      console.log(this.groupeForm.value.nom)
      const newGroupe: Groupe = {
        nom: this.groupeForm.value.nom,
        actionneur: this.userConnected
      };
        
      this.groupeService.updateGroupe(newGroupe, this.groupe.idGroupe ,this.userConnected.idUser!).subscribe({
        next: (response) => {
            console.log(response); 
            this.groupe = response; 
            this.isNewGroup = false;    
            this.errorMessage = '';
           
            if (buttonType === 'create') {
              this.successMessage = `Groupe "${response.nom}" modifiée avec succès !`;   
              setTimeout(() => {
                this.closeForm();
                this.successMessage = '';
              }, 2000);
            } else if (buttonType === 'createAndAssign') {
              this.goToNextStep();
            }
        },
        error: (err) => {
         
          this.successMessage = '';
          console.error('Erreur lors de l’ajout :', err);
  
          if (err.status === 404) {
            this.errorMessage = "Actionneur introuvable";
          } else if (err.status === 409) {
            this.errorMessage = "Un groupe avec ce nom existe déjà.";
          } else {
            this.errorMessage = "Une erreur inattendue est survenue.";
          }
  
          setTimeout(() => {
            this.errorMessage = '';
          }, 2000);
        }
      });
    } else {
      this.groupeForm.markAllAsTouched();
    }
    
  }

  // Méthode pour définir l'étape active
  setStep(step: number) {
    if (this.groupeForm.valid && this.groupe.nom === this.groupeForm.value.nom ) {
      this.currentStep = step;
    } else {
      this.groupeForm.markAllAsTouched();
    }
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
        this.selectedUsers = new Set(this.users?.filter(user => user.groupe?.idGroupe === this.groupe.idGroupe).map(user => user.idUser!)); // hatytha lenna mech fel ngOninit khater feha this.users wel fel oninit mazelt null 
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
  
    
      const isAssigned = this.selectedPermissions.has(permission.idPermission!);
  
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
  
    
      const isAssigned = this.selectedMenus.has(menu.idMenu!);
  
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
  // Méthode pour ajouter les relations (menus, permissions, utilisateurs) après l'enregistrement du groupe
  addRelationsToGroup(): void {

    this.groupeService.addRelationsToGroup(this.groupe.idGroupe!, Array.from(this.selectedMenus), Array.from(this.selectedPermissions), Array.from(this.selectedUsers))
      .subscribe(response => {
        console.log('Relations ajoutées avec succès:', response);
        // this.successMessage = `Groupe "${this.groupe.nom}" ajoutée avec succès !`;
    
        // setTimeout(() => {
          this.closeForm();
        //   this.successMessage = '';
        // }, 2000);
      }, error => {
        console.error('Erreur lors de l\'ajout des relations:', error);
      });
  }
 // Sélectionner un utilisateur
  toggleUserSelection(userId: number) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }
  // Sélectionner un menu
  toggleMenuSelection(menuId: number) {
    if (this.selectedMenus.has(menuId)) {
      this.selectedMenus.delete(menuId);
    } else {
      this.selectedMenus.add(menuId);
    }
  }
  // Sélectionner une permission
  togglePermissionSelection(permissionId: number) {
    if (this.selectedPermissions.has(permissionId)) {
      this.selectedPermissions.delete(permissionId);
    } else {
      this.selectedPermissions.add(permissionId);
    }
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
