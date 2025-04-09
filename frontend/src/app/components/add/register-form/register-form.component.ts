import {Component, EventEmitter, Output, inject, HostListener, ViewChild, ElementRef, Input} from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder, FormArray} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';
import {UserService} from '../../../services/user.service';
import {Genre, Role, User, UserStatus} from '../../../models/User';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent {
  @ViewChild('roleInput', { static: false }) roleInput!: ElementRef;
  @ViewChild('roleDropdown', { static: false }) roleDropdown!: ElementRef;
  //event pour l'update
  @Input() userToUpdate: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  constructor(private userService:UserService,private zoneService: ZoneService) {}
  
  userConnected !: User;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.loadZones();
    // Populate roles from the Role enum
    this.roles = Object.values(Role);
    this.filteredRoles = this.roles; // Initially show all roles
  }

  private fb =inject(FormBuilder);
  // Définition du formulaire
  registerForm : FormGroup =this.fb.group({
    nom: ['', Validators.required],
    prenom: ['',Validators.required],
    matricule : ['',Validators.required],
    email : ['',Validators.required],
    // password : ['',Validators.required],
    numero :[''],
    genre: [''],
    role: [null, Validators.required] ,
    zones: this.fb.array([])  ,  status : ['']
  });

  ngOnChanges() {
    console.log('ngOnChanges triggered, userToUpdate:', this.userToUpdate);
    if (this.userToUpdate) {
      this.registerForm.patchValue({
        nom: this.userToUpdate.nom || '',
        prenom: this.userToUpdate.prenom || '',
        matricule: this.userToUpdate.matricule || '',
        email: this.userToUpdate.email || '',
        numero: this.userToUpdate.num || '',
        genre: this.userToUpdate.genre || '',
        role: this.userToUpdate.role || null,
        status: this.userToUpdate.status || ''
      });
  
      // Pre-fill zones
      const zonesArray = this.registerForm.get('zones') as FormArray;
      zonesArray.clear();
      if (this.userToUpdate.zones) {
        this.userToUpdate.zones.forEach(zone => {
          zonesArray.push(this.fb.control(zone.idZone));
        });
      }
      console.log('Form value after patchValue:', this.registerForm.value);
    }
  }

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
    loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;}); }
  selectedZones: number[] = []; // Stocker les zones sélectionnées

  steps = ["Informations Personnelles", "Coordonnées", "Profil Utilisateur"];
  currentStep = 1;
  showDropdown = false;
  // Liste des zones
  zones: Zone[] = [];
  roles: Role[] = [];
  searchText:string ="" ;
  filteredRoles: Role[] = [];
  role?:Role;
  
  // Dynamically position the dropdown above the input
  adjustDropdownPosition() {
    if (this.roleInput && this.roleDropdown) {
      const input = this.roleInput.nativeElement;
      const dropdown = this.roleDropdown.nativeElement;

      const rect = input.getBoundingClientRect();
      const dropdownHeight = dropdown.offsetHeight;

      dropdown.style.top = `${rect.top + window.scrollY - dropdownHeight - 4}px`; // 4px margin above
      dropdown.style.left = `${rect.left + window.scrollX}px`;
      dropdown.style.width = `${rect.width}px`;
    }
  }
  filterRoles() {
    if (!this.searchText) {
      this.filteredRoles = this.roles; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    this.filteredRoles = this.roles.filter((r) =>
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
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value; // Update searchText with the input value
    this.filterRoles();
    this.showDropdown = true;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterRoles();
      this.adjustDropdownPosition(); // Adjust position when opening
    }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropDown`);
    const button = target.closest('button[data-dropdown-toggle]');
    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showDropdown !== null && dropdown && !dropdown.contains(target) && !button) {
      this.showDropdown = false; }}
  //Zone
  // Charger les zones depuis le service

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
  //l update
  updateUser() {
    if (!this.userToUpdate || !this.userToUpdate.idUser) {
      console.error('Utilisateur à mettre à jour non défini ou ID manquant');
      return;
    }
    const updatedUser: User = {
      ...this.userToUpdate,
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      matricule: this.registerForm.value.matricule,
      email: this.registerForm.value.email,
      num: this.registerForm.value.numero,
      genre: this.registerForm.value.genre.toUpperCase(),
      role: this.registerForm.value.role.toUpperCase(),
      status: this.registerForm.value.status,
      zones: this.registerForm.value.zones.map((zoneId: number) => ({ idZone: zoneId } as Zone))};

    const idActionneur = this.userConnected.idUser!;
    this.userService.updateUser(this.userToUpdate.idUser, updatedUser, idActionneur).subscribe({
      next: (response) => {
        console.log('✅ Utilisateur mis à jour avec succès', response);
        // Compare old zones with new zones
        const oldZoneIds = this.userToUpdate!.zones?.map(zone => zone.idZone) || [];
        const newZoneIds = this.registerForm.get('zones')?.value || [];

        // Zones to remove (in old but not in new)
        const zonesToRemove = oldZoneIds.filter(zoneId => !newZoneIds.includes(zoneId));
        // Zones to add (in new but not in old)
        const zonesToAdd = newZoneIds.filter((zoneId: number) => !oldZoneIds.includes(zoneId));

        // Remove zones
        let removeObservables = zonesToRemove.map(zoneId => {
          if (zoneId !== undefined) {
            return this.userService.removeZone(this.userToUpdate!.idUser!, zoneId, idActionneur);
          }
          return null;
        }).filter(obs => obs !== null);

        // Chain the removal of zones
        if (removeObservables.length > 0) {
          forkJoin(removeObservables).subscribe({
            next: () => {
              console.log('✅ Zones supprimées avec succès');
              this.addZones(zonesToAdd, idActionneur);
            },
            error: (error: any) => {
              console.error('❌ Erreur lors de la suppression des zones', error);
            }
          });
        } else {
          // If no zones to remove, proceed to add new zones
          this.addZones(zonesToAdd, idActionneur);
        }
      },
      error: (error) => {console.error('❌ Erreur lors de la mise à jour de l\'utilisateur', error);}
    });
  }
  addZones(zonesToAdd: number[], idActionneur: number) {
    if (zonesToAdd.length > 0) {
      let addObservables = zonesToAdd.map(zoneId =>
        this.userService.attribuerZone(this.userToUpdate!.idUser!, zoneId, idActionneur) );
      forkJoin(addObservables).subscribe({
        next: () => {
          console.log('✅ Zones ajoutées avec succès');
          this.userUpdated.emit();
          this.close.emit();
        },
        error: (error) => {console.error('❌ Erreur lors de l\'ajout des zones', error);}
      });
    } else {
      // If no zones to add, emit events to close the form
      this.userUpdated.emit();this.close.emit(); }}
  // Soumettre le formulaire
  submitForm() {
    if (this.userToUpdate) {
      // Update mode
      this.updateUser();
    }else{
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const user: any = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        genre: this.registerForm.value.genre.toUpperCase(),
        email: this.registerForm.value.email,
        matricule: this.registerForm.value.matricule,
        password: "123456",  // Correction de la majuscule
        num: this.registerForm.value.numero,
        actionneur: this.userConnected.idUser!, // Correction de la majuscule
        status: this.registerForm.value.status,
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
              next:(response) =>{ console.log('Zone attribuée avec succès:', response);},
              error: (error) => {console.error('❌ Erreur lors de l\'ajout de l\'Userzone', error);}});});
            },
        error: (error) => {console.error('❌ Erreur lors de l\'ajout de l\'utilisateur', error);}       
      });
      console.log("Données soumises :", user);} else { console.log("❌ Formulaire invalide !"); }}
}}
