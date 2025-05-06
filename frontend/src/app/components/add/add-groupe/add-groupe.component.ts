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
  constructor(private userService:UserService, private menuService: MenuService,private groupeService: GroupeService) {}
  currentStep : number = 1;
  userConnected !: User;
  steps = ["Groupe", "Menu & Permissions" , "Utilsateurs"];
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
  menuPermissions: { [menuId: number]: Permission[] } = {};
  expandedMenus = new Set<number>(); // pour suivre les menus ouverts
  disabledPermissions: Set<number> = new Set<number>();

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getUsers(); 
    this.getMenus();
    
    if (this.groupe && this.groupe.idGroupe) {
      this.isNewGroup = false;
      this.groupeForm = new FormGroup({
        nom: new FormControl(this.groupe.nom, [Validators.required])
      });
  
      // Charger les permissions sélectionnées
      this.selectedPermissions = new Set(this.groupe.permissions?.map(permission => permission.idPermission!));
  
      // Si tu veux que les selectedMenus soient basés sur les selectedPermissions lors de la mise à jour
      const permissions = this.groupe?.permissions || [];
      const uniqueMenusMap = new Map<number, Menu>();
  
      for (const permission of permissions) {
        const menu = permission.menu;
        if (menu && !uniqueMenusMap.has(menu.idMenu)) {
          uniqueMenusMap.set(menu.idMenu, menu);
        }
      }
  
      // Affichage menus déjà associés à des permissions
      this.menus = Array.from(uniqueMenusMap.values());
  
      // Initialisation des menus cochés
      this.selectedMenus = new Set(this.menus.map(m => m.idMenu!));
      console.log(this.selectedMenus);
  
      // Ajouter les menus sélectionnés à menuPermissions
      this.menuPermissions = {}; // Initialiser un objet pour stocker les permissions par menu
      for (const menu of this.menus) {
        // Ajouter les permissions associées au menu
        //this.menuPermissions[menu.idMenu!] = this.groupe.permissions?.filter(permission => permission.menu?.idMenu === menu.idMenu!) || [];
        this.loadPermissionsByMenu(menu.idMenu);
      }
  
      console.log('Menu Permissions:', this.menuPermissions);
    } else {
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
  getMenus() {
    this.menuService.getAllMenus().subscribe(
      (menus) => {
        // Exclure les menus dont le nom est 'groupes', 'zones' ou 'utilisateurs' (insensible à la casse)
        const nomsExclus = ['groupes', 'zones', 'utilisateurs'];
        this.menus = menus.filter(menu =>
          !nomsExclus.includes(menu.nom.toLowerCase())
        );
      },
      (error) => {
        console.error('Erreur lors de la récupération des menus', error);
      }
    );
  }
  
  getUsers(){
    this.userService.getAll().subscribe(
      (data: User[]) => {
        if (this.groupe && this.groupe.idGroupe) {
          this.users = data.filter(user => !user.groupe || !user.groupe.idGroupe || user.groupe?.idGroupe === this.groupe.idGroupe);
          this.selectedUsers = new Set(this.users?.filter(user => user.groupe?.idGroupe === this.groupe.idGroupe).map(user => user.idUser!)); // hatytha lenna mech fel ngOninit khater feha this.users wel fel oninit mazelt null 
        }else{
          this.users = data.filter(user => !user.groupe || !user.groupe.idGroupe );
        }
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
    console.log("pppppppppppppppp",this.selectedPermissions)
    const array1 = Array.from(new Set(this.groupe.permissions?.map(p => p.idPermission!)));
    const array2 = Array.from(this.selectedPermissions);
    const array3 = Array.from(new Set(this.groupe.menus?.map(m => m.idMenu!)));
    const array4 = Array.from(this.selectedMenus);
    const array5 = Array.from(new Set(this.users?.filter(user => user.groupe?.idGroupe === this.groupe.idGroupe).map(user => user.idUser!)));
    const array6 = Array.from(this.selectedUsers);

    if(!array1.every(item => array2.includes(item)) || !array2.every(item => array1.includes(item)) 
      || !array4.every(item => array3.includes(item))|| !array5.every(item => array6.includes(item)) || !array6.every(item => array5.includes(item)) ){
      this.groupeService.addRelationsToGroup(this.groupe.idGroupe!, Array.from(this.selectedPermissions), Array.from(this.selectedUsers), this.userConnected.idUser!)
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
    }else{
      this.closeForm();
    }
  }
 // Sélectionner un utilisateur
  toggleUserSelection(userId: number) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
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

  // selectAllPermissions(event: Event ) {
  //   const isChecked = (event.target as HTMLInputElement).checked;
  //   if (isChecked) {
  //     this.filteredPermissions.forEach(permission => this.selectedPermissions.add(permission.idPermission!));
  //   } else {
  //     this.selectedPermissions.clear();
  //   }
  // }
  selectAllUsers(event: Event ) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.filteredUsers.forEach(user => this.selectedUsers.add(user.idUser!));
    } else {
      this.selectedUsers.clear();
    }
  }
  // selectAllMenus(event: Event ) {
  //   const isChecked = (event.target as HTMLInputElement).checked;
  //   if (isChecked) {
  //     this.filteredMenus.forEach(menu => this.selectedMenus.add(menu.idMenu!));
  //   } else {
  //     this.selectedMenus.clear();
  //   }
  // }

 
  // loadPermissionsByMenu(menuId: number): void {
  //   if (!this.menuPermissions[menuId]) {
  //     this.menuService.getPermissionsByMenu(menuId).subscribe(
  //       (permissions: Permission[]) => {
  //         this.menuPermissions[menuId] = permissions;
  //       },
  //       (error) => {
  //         console.error(`Erreur lors du chargement des permissions pour le menu ${menuId}`, error);
  //       }
  //     );
  //   }
  // }
  toggleMenuCollapse(menuId: number) {
    if (this.expandedMenus.has(menuId)) {
      this.expandedMenus.delete(menuId);
    } else {
      this.expandedMenus.clear(); 
      this.expandedMenus.add(menuId);
      this.loadPermissionsByMenu(menuId);
    }
  }
  
  toggleMenuSelection(menuId: number) {
    console.log("toggle")
    console.log(menuId)
    if (!this.selectedMenus.has(menuId)) {
      this.expandedMenus.clear(); // Fermer tous les autres menus ouverts
    }
    if (this.selectedMenus.has(menuId)) {
      // Désélectionner le menu
      console.log("1");
      this.selectedMenus.delete(menuId);
      this.expandedMenus.delete(menuId); // Fermer le collapse
  
      // Supprimer toutes les permissions associées à ce menu de selectedPermissions
      const menuPermissions = this.menuPermissions[menuId] || [];
      menuPermissions.forEach(permission => {
        this.selectedPermissions.delete(permission.idPermission!);
      });
      delete this.menuPermissions[menuId];
      console.log(this.selectedMenus)
      console.log(this.selectedPermissions);
    } else {
      console.log("2");
      // Sélectionner le menu
      this.selectedMenus.add(menuId);
      this.expandedMenus.add(menuId); // Ouvrir le collapse
  
      // Charger les permissions du menu
      this.loadPermissionsByMenu(menuId);
    }
  }
  
 
  
  loadPermissionsByMenu(menuId: number) {
    if (!this.menuPermissions[menuId]) {
      this.menuService.getPermissionsByMenu(menuId).subscribe(
        (permissions: Permission[]) => {
          // Récupérer le nom du menu pour une meilleure gestion
          const menuName = this.menus.find(menu => menu.idMenu === menuId)?.nom;
  
          if (menuName) {
            console.log('Permissions pour le menu:', permissions);
  
            // Trouver la permission avec l'ID le plus petit
            const smallestPermission = permissions.reduce((prev, curr) => 
              prev.idPermission! < curr.idPermission! ? prev : curr
            );
  
            console.log('Permission avec l\'ID le plus petit:', smallestPermission);
  
            // Ajouter cette permission à la liste des permissions sélectionnées
            if (smallestPermission) {
              this.selectedPermissions.add(smallestPermission.idPermission!);
              this.disabledPermissions = new Set([smallestPermission.idPermission!]); // Ajout de l'ID de la permission désactivée
            }
  
            // Ajouter toutes les permissions du menu dans `menuPermissions`
            this.menuPermissions[menuId] = permissions;
  
            console.log('Permissions sélectionnées après modification:', this.selectedPermissions);
          }
        },
        (error) => {
          console.error('Erreur lors du chargement des permissions pour le menu', error);
        }
      );
    }
  }
  
  
}