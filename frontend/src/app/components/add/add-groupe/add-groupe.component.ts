import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { PermissionService } from '../../../services/permission.service';
import { Menu } from '../../../models/Menu';
import { Permission } from '../../../models/Permission';

@Component({
  selector: 'app-add-groupe',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './add-groupe.component.html',
  styleUrl: './add-groupe.component.css'
})
export class AddGroupeComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private userService:UserService, private menuService: MenuService,
    private permissionService: PermissionService) {}
  currentStep : number = 1;
  userConnected !: User;
  steps = ["Groupe", "Utilsateurs", "Menu","Permissions"];
  users: User[] = [];
  groupName: string = '';
  menus: Menu[] = [];
  permissions: Permission[] = [];
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
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
    if (this.groupName) {
      console.log('Nom du groupe:', this.groupName);
      this.goToNextStep();  // Passe à l'étape suivante si le nom est valide
    } else {
      alert('Veuillez entrer un nom pour le groupe.');
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
    });
    console.log(this.menus);
  }
  getPermissions(){
    // Récupérer toutes les permissions
    this.permissionService.getAllPermissions().subscribe((permissions) => {
      this.permissions = permissions;  
    });
    console.log(this.permissions);
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
}
