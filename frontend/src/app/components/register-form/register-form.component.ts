import {Component, EventEmitter, Output, inject, HostListener} from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder, FormArray} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Zone } from '../../models/Zone';
import { ZoneService } from '../../services/zone.service';
import {UserService} from '../../services/user.service';
import {Genre, Role, User, UserStatus} from '../../models/User';
import {User_Zone} from '../../models/User_Zone';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent {
  constructor(private userService:UserService,private zoneService: ZoneService) {}
  userConnected !: User;

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.loadZones();
  }

  private fb =inject(FormBuilder);
  // Définition du formulaire
  registerForm : FormGroup =this.fb.group({
    nom: ['', Validators.required],
    prenom: ['',Validators.required],
    matricule : ['',Validators.required],
    email : ['',Validators.required],
    password : ['',Validators.required],
    numero :[''],
    genre: [''],
    role: [null, Validators.required] ,
    zones: this.fb.array([])  ,  status : ['']
  });
  toggleZoneSelection(idZone: number) {
    const zonesArray: FormArray = this.registerForm.get('zones') as FormArray;
    const index = zonesArray.controls.findIndex((control) => control.value === idZone);

    if (index === -1) {
      // Ajouter la zone
      zonesArray.push(this.fb.control(idZone));
    } else {
      // Retirer la zone
      zonesArray.removeAt(index);
    }
    console.log('Zones sélectionnées:', zonesArray.value);
  }

  steps = ["Informations Personnelles", "Coordonnées", "Profil Utilisateur"];
  currentStep = 1;

  // Événements pour fermer et soumettre le formulaire
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();
  showDropdown = false;

  // Liste des zones
  zones: Zone[] = [];
  roles: Role[] = [];
  searchText:string ="" ;
  filteredRoles: Role[] = [];
  role?:Role;
  filterRoles() {
    if (!this.searchText) {
      this.filteredRoles = this.roles; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    this.filteredRoles = this.roles.filter(r =>
      r.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectRole(role: Role) {
    console.log('✅ Rôle sélectionné :', role);
    this.searchText = role;
    this.role = role;
    this.registerForm.get('role')?.setValue(role);
    this.showDropdown = false;
  }

  // Gérer l'événement de saisie dans l'input
  onSearchChange() {
    this.filterRoles(); // Filtrer les produits
    this.showDropdown = true; // Afficher la liste déroulante
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterRoles(); // Filtrer au moment où le dropdown est affiché
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropDown`);
    const button = target.closest('button[data-dropdown-toggle]');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showDropdown !== null && dropdown && !dropdown.contains(target) && !button) {
      this.showDropdown = false; // Ferme le dropdown
    }
  }
  //Zone
  // Charger les zones depuis le service
  loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;
    });
  }
  selectedZones: number[] = []; // Stocker les zones sélectionnées




  // Navigation entre les étapes
  goToNextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.submitForm();  // Sauvegarde quand c'est la dernière étape
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

  // Soumettre le formulaire
  submitForm() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      const user: any = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        genre: this.registerForm.value.genre.toUpperCase(),
        email: this.registerForm.value.email,
        matricule: this.registerForm.value.matricule,
        password: this.registerForm.value.password,  // Correction de la majuscule
        num: this.registerForm.value.numero,
        actionneur: this.userConnected.idUser!, // Correction de la majuscule
        status: this.registerForm.value.status.toUpperCase(),
        role: this.registerForm.value.role.toUpperCase() || null, // Ajout d'une valeur par défaut
        // zones: Array.isArray(this.registerForm.value.zones) ? this.registerForm.value.zones : [],
        // modifieLe: new Date(),
      };

      const idActionneur = this.userConnected.idUser!;
      // Passer l'ID de l'actionneur dans la requête
      this.userService.Register(user, idActionneur).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur ajouté avec succès', response);
          const selectedZone = this.registerForm.get('zones')?.value;
          console.log(selectedZone);
          selectedZone.forEach((zoneId: number) => {
            console.log(zoneId)
            this.userService.attribuerZone(response.user.idUser, zoneId,idActionneur).subscribe({
              next:(response) =>
              {
                  console.log('Zone attribuée avec succès:', response);
              },
              error: (error) => {
                console.error('❌ Erreur lors de l\'ajout de l\'Userzone', error);
              }

            });
          });        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'ajout de l\'utilisateur', error);
        }
      });
      console.log("Données soumises :", user);
    } else {
      console.log("❌ Formulaire invalide !");
    }


}}
