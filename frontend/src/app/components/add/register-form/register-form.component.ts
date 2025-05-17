import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Groupe } from '../../../models/Groupe';
import { User } from '../../../models/User';
import { Zone } from '../../../models/Zone';
import { GroupeService } from '../../../services/groupe.service';
import { UserService } from '../../../services/user.service';
import { ZoneService } from '../../../services/zone.service';
@Component({ selector: 'app-register-form',standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',})
export class RegisterFormComponent {
  @ViewChild('groupeInput', { static: false }) groupeInput!: ElementRef;
  @ViewChild('groupeDropdown', { static: false }) groupeDropdown!: ElementRef;
  @ViewChild('zonesDropdown', { static: false }) zonesDropdown!: ElementRef; 

  showDropdown: boolean = false; // Pour le dropdown du groupe
  isZonesDropdownOpen: boolean = false; // Pour le dropdown des zones
  isStatusArrowRotated: boolean = false;
  isGenreArrowRotated: boolean = false;
  //event pour l'update
  @Input() userToUpdate: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  constructor(private userService:UserService,private zoneService: ZoneService,private groupeService: GroupeService) {}
  alreadyExist : Boolean = false;
  userConnected !: User;
  steps = ["Informations Personnelles", "Coordonnées", "Profil Utilisateur"];
  currentStep = 1;
  // Liste des zones
  zones: Zone[] = [];
  groupes: Groupe[] = [];
  selectedGroupe: Groupe | null | undefined;
  filteredGroupes: Groupe[] = [];
  searchText:string ="" ;
  zonesErrorMessage: string | null = null;

 groupeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const groupe = control.value as Groupe | null;
      if (groupe && !groupe.idGroupe) {
        return { missingIdGroupe: true };
      }
      return null;
    };
  }
  zonesValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const groupe = form.get('groupe')?.value as Groupe | null;
      const zones = form.get('zones') as FormArray;
      if (groupe && groupe.nom !== 'SUPERUSER' && zones.length === 0) {
        return { zonesRequired: true };
      }
      return null;
    };
  }

// Définition du formulaire
  private fb =inject(FormBuilder);
  registerForm : FormGroup =this.fb.group({
  nom: ['', Validators.required],
  prenom: ['',Validators.required],
  matricule : ['',Validators.required],
  email: ['', [Validators.required, Validators.email]],
  numero: ['', [Validators.pattern('^\\d+$'), Validators.minLength(8)]], // Ajout de minLength 
   genre: [null],
  zones: this.fb.array([]),
  status: [null],
  groupe: [null, [Validators.required, this.groupeValidator()]]
}, { validators: this.zonesValidator() });
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {this.userConnected = JSON.parse(userFromLocalStorage);}
    this.loadZones();
    this.loadGroupes(); // Charger les groupes depuis le backend
    this.registerForm.get('groupe')?.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity({ onlySelf: true });
    });
    this.registerForm.get('zones')?.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity();
    }); }
    ngOnChanges() {
      console.log('ngOnChanges triggered, userToUpdate:', this.userToUpdate);
      if (this.userToUpdate) {
        this.registerForm.patchValue({
          nom: this.userToUpdate.nom || '',
          prenom: this.userToUpdate.prenom || '',
          matricule: this.userToUpdate.matricule || '',
          email: this.userToUpdate.email || '',
          numero: this.userToUpdate.num || '',
          genre: this.userToUpdate.genre || null,
          groupe: this.userToUpdate.groupe || null,
          status: this.userToUpdate.status || null    });

        if (this.userToUpdate.groupe?.nom) {
          this.searchText = this.userToUpdate.groupe.nom;
          this.selectedGroupe = this.userToUpdate.groupe;
        } else {
          this.searchText = '';
          this.selectedGroupe = null;
        }
        // Pre-fill zones
        const zonesArray = this.registerForm.get('zones') as FormArray;
        zonesArray.clear();
        if (this.userToUpdate.zones) {
          this.userToUpdate.zones.forEach(zone => {
            if (zone.idZone !== undefined) {
              zonesArray.push(this.fb.control(zone.idZone));
            } } );
        }
        console.log('Form value after patchValue:', this.registerForm.value)}}
  loadGroupes() {
    this.groupeService.getAll().subscribe({
      next: (groupes) => {
        this.groupes = groupes;
        this.filteredGroupes = this.groupes;
        console.log('Groupes chargés depuis le backend:', this.groupes);}, error: (error) => { console.error('Erreur lors du chargement des groupes:', error);}});
  }
    
//     Validators.pattern('^\d+$') :
// ^ : Début de la chaîne.
// \\d+ : Un ou plusieurs chiffres (0-9).
// $ : Fin de la chaîne.
// Exemples valides : 123, 4567890.
// Exemples invalides : 123abc, 12-34, `` (chaîne vide passe car le champ est facultatif)
 

   // Grouuuuuuuuuuuuuuuuuuuupe
  filterGroupes() {
    if (!this.searchText) { this.filteredGroupes = this.groupes; return;  }
    this.filteredGroupes = this.groupes.filter((groupe) =>
      groupe.nom.toLowerCase().includes(this.searchText.toLowerCase()));
         }
  selectGroupe(groupe: Groupe) {
      console.log('✅ Groupe sélectionné :', groupe);
      this.registerForm.get('groupe')?.setValue(groupe); // valeur réelle
      this.searchText = groupe.nom;                      // valeur affichée
      this.showDropdown = false;
    }

    clearGroupeSearch() {
      this.searchText = '';
      this.registerForm.get('groupe')?.setValue(null);
      this.filteredGroupes = this.groupes;
      //this.showProduitDropdown = false;
    }
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
  closeForm() { this.close.emit(); }
  //l update
 updateUser() {
  if (!this.userToUpdate || !this.userToUpdate.idUser) {
    console.error('Utilisateur à mettre à jour non défini ou ID manquant');
    this.showFailAlert();
    return;
  }

  if (!this.userConnected || !this.userConnected.idUser) {
    console.error('Utilisateur connecté non défini ou ID manquant');
    return;
  }

  const idActionneur = this.userConnected.idUser!;
  const updatedUser: User = {
    ...this.userToUpdate,
    nom: this.registerForm.value.nom,
    prenom: this.registerForm.value.prenom,
    matricule: this.registerForm.value.matricule,
    email: this.registerForm.value.email,
    num: this.registerForm.value.numero,
    genre: this.registerForm.value.genre ? this.registerForm.value.genre.toUpperCase() : null,
    groupe: this.registerForm.value.groupe,
    status: this.registerForm.value.status || null,
    zones: this.registerForm.value.zones.map((zoneId: number) => ({ idZone: zoneId } as Zone))
  };

  // 1. Mise à jour de l'utilisateur de base
  this.userService.updateUser(this.userToUpdate.idUser, updatedUser, idActionneur).subscribe({
    next: (response) => {
      console.log('✅ Utilisateur mis à jour avec succès', response);
      
      // 2. Gestion du groupe (si modifié)
      const selectedGroupe = this.registerForm.get('groupe')?.value;
      const previousGroupe = this.userToUpdate?.groupe;

      if (selectedGroupe?.idGroupe !== previousGroupe?.idGroupe) {
        this.userService.attribuerGroupe(this.userToUpdate?.idUser!, selectedGroupe?.idGroupe || null, idActionneur)
          .subscribe({
            next: () => {
              console.log('✅ Groupe mis à jour avec succès');
              this.handleZoneUpdates(idActionneur); // Passer à la gestion des zones
            },
            error: (error) => {
              console.error('❌ Erreur groupe', error);
              this.showFailAlert();
            }
          });
      } else {
        this.handleZoneUpdates(idActionneur); // Passer directement aux zones si groupe inchangé
      }
    },
    error: (error) => {
      console.error('❌ Erreur mise à jour utilisateur', error);
      this.showFailAlert();
    }
  });
}

// Nouvelle méthode pour gérer les zones
private handleZoneUpdates(idActionneur: number) {
  const oldZoneIds = this.userToUpdate!.zones?.map(zone => zone.idZone) || [];
  const newZoneIds = this.registerForm.get('zones')?.value || [];

  const zonesToRemove = oldZoneIds.filter(zoneId => !newZoneIds.includes(zoneId));
  const zonesToAdd = newZoneIds.filter((zoneId: number) => !oldZoneIds.includes(zoneId));

  // Créer un tableau d'observables pour les suppressions
  const removeObservables = zonesToRemove
    .filter(zoneId => zoneId !== undefined)
    .map(zoneId => this.userService.removeZone(this.userToUpdate!.idUser!, zoneId, idActionneur));

  // Exécuter les suppressions si nécessaire
  if (removeObservables.length > 0) {
    forkJoin(removeObservables).subscribe({
      next: () => {
        console.log('✅ Zones supprimées avec succès');
        this.addZones(zonesToAdd, idActionneur);
      },
      error: (error) => {
        console.error('❌ Erreur suppression zones', error);
        this.showFailAlert();
      }
    });
  } else {
    this.addZones(zonesToAdd, idActionneur);
  }
}

// Modifier addZones pour toujours montrer l'alerte
private addZones(zonesToAdd: number[], idActionneur: number) {
  if (zonesToAdd.length > 0) {
    const addObservables = zonesToAdd.map(zoneId =>
      this.userService.attribuerZone(this.userToUpdate!.idUser!, zoneId, idActionneur)
    );

    forkJoin(addObservables).subscribe({
      next: () => {
        console.log('✅ Zones ajoutées avec succès');
        this.showSuccessAlertAndClose();
      },
      error: (error) => {
        console.error('❌ Erreur ajout zones', error);
        this.showFailAlert();
      }
    });
  } else {
    // Même si pas de zones à ajouter, on montre le succès
    this.showSuccessAlertAndClose();
  }
}

// Nouvelle méthode pour l'alerte de succès
private showSuccessAlertAndClose() {
  this.showSuccessAlert = true;
  setTimeout(() => {
    this.showSuccessAlert = false;
    this.userUpdated.emit();
    this.closeForm();
  }, 3000);
}
  submitForm() {
    this.registerForm.markAllAsTouched();
    this.zonesErrorMessage = null; // Réinitialiser le message des zones
    this.registerForm.updateValueAndValidity();
    if (!this.registerForm.valid) {
      if (this.registerForm.errors?.['zonesRequired']) {
        this.zonesErrorMessage = 'Veuillez sélectionner au moins une zone pour cet utilisateur.';
      }
      console.log('❌ Formulaire invalide !', this.registerForm.errors);
      this.showFailAlert();
      return;
    }
    if (this.userToUpdate) {
      this.updateUser();
    } else {
      const user: any = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        genre: this.registerForm.value.genre ? this.registerForm.value.genre.toUpperCase() : null,
        email: this.registerForm.value.email,
        matricule: this.registerForm.value.matricule,
        password: "123456",
        num: this.registerForm.value.numero,
        actionneur: this.userConnected.idUser!,
        status: this.registerForm.value.status || null
      };

      const idActionneur = this.userConnected.idUser!;
    this.userService.Register(user, idActionneur).subscribe({
      next: (response) => {
        console.log('✅ Utilisateur ajouté avec succès', response);
        const selectedGroupe = this.registerForm.get('groupe')?.value as Groupe;
        if (!selectedGroupe?.idGroupe) {
          console.error('❌ Aucun ID de groupe sélectionné');
          this.showFailAlert();
          return;
        }
        this.userService.attribuerGroupe(response.user.idUser, selectedGroupe.idGroupe, idActionneur).subscribe({
          next: () => {
            console.log('✅ Groupe attribué avec succès');
            this.assignZones(response.user.idUser, idActionneur);
          },
          error: (error) => {
            console.error('❌ Erreur lors de l\'attribution du groupe', error);
            this.showFailAlert();
          }
        });
      },
      error: (error) => {
        this.alreadyExist = true;
        this.zonesErrorMessage = null;
        this.showFailAlert();
        console.error('❌ Erreur lors de l\'ajout de l\'utilisateur', error);
      }
    });
    console.log("Données soumises :", user);
  }
}
assignZones(userId: number, idActionneur: number) {
  const selectedZone = this.registerForm.get('zones')?.value as number[];
  const groupe = this.registerForm.get('groupe')?.value as Groupe;

  if (groupe.nom !== 'SUPERUSER' && (!selectedZone || selectedZone.length === 0)) {
    this.registerForm.setErrors({ zonesRequired: true });
    this.zonesErrorMessage = 'Veuillez sélectionner au moins une zone pour ce groupe.';
    this.showFailAlert();
    return;
  }

  if (selectedZone && selectedZone.length > 0) {
    const zoneObservables = selectedZone.map((zoneId: number) => {
      return this.userService.attribuerZone(userId, zoneId, idActionneur);
    });
    forkJoin(zoneObservables).subscribe({
      next: () => {
        console.log('✅ Zones attribuées avec succès');
        this.hideAlert();
        this.showAlertAndClose();
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout des zones', error);
        this.showFailAlert();
      }
    });
  } else {
    this.showAlertAndClose();
  }
}
loadZones() {
  this.zoneService.getAll().subscribe(zones => {
    this.zones = zones;}); }
    getSelectedZoneNames(): string {
      const selectedZoneIds = (this.registerForm.get('zones')?.value || []) as number[];
      return this.zones
        .filter(zone => zone.idZone !== undefined && selectedZoneIds.includes(zone.idZone!))
        .map(zone => zone.nom)
        .join(', ') || 'Zone';
    }
    toggleZoneSelection(zoneId: number) {
      const zonesArray = this.registerForm.get('zones') as FormArray;
      const index = zonesArray.controls.findIndex(control => control.value === zoneId);
      if (index === -1) {
        zonesArray.push(this.fb.control(zoneId));
      } else {
        zonesArray.removeAt(index);
      }
      console.log('Zones sélectionnées:', zonesArray.value);
    }
// aleeeeeeeeerrtt
showSuccessAlert: boolean = false;
showEchecAlert : boolean = false;
hideAlert(){ 
    this.showSuccessAlert = false;
    this.showEchecAlert = false;
    this.zonesErrorMessage = null;
  
}
showAlertAndClose() {this.showEchecAlert = false; this.showSuccessAlert = true; setTimeout(()=>{this.showSuccessAlert = false;  this.closeForm();},3000); }
showFailAlert() {this.showSuccessAlert = false ; this.showEchecAlert = true; setTimeout(()=> { this.showEchecAlert = false;},3500); }
  // Dynamically position the dropdown above the input
  adjustDropdownPosition() {
    if (this.groupeInput && this.groupeDropdown) {
      const input = this.groupeInput.nativeElement;
      const dropdown = this.groupeDropdown.nativeElement;

      const rect = input.getBoundingClientRect();
      const dropdownHeight = dropdown.offsetHeight;

      dropdown.style.top = `${rect.top + window.scrollY - dropdownHeight - 4}px`; // 4px margin above
      dropdown.style.left = `${rect.left + window.scrollX}px`;
      dropdown.style.width = `${rect.width}px`;
    }
  }

  selectedZones: number[] = []; // Stocker les zones sélectionnées
  onSearchChange(value: string) {
    this.searchText = value;
    this.filteredGroupes = this.groupes.filter(groupe =>
      groupe.nom.toLowerCase().includes(value.toLowerCase())
    );
    this.showDropdown = true;
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) { this.filterGroupes(); this.adjustDropdownPosition(); } }
    @HostListener('document:click', ['$event'])
    closeDropdown(event: MouseEvent) {
      const target = event.target as HTMLElement;
  
      // Fermer le dropdown du groupe
      const groupeDropdown = document.getElementById('dropDown');
      const groupeButton = target.closest('button[data-dropdown-toggle]');
      if (this.showDropdown && groupeDropdown && !groupeDropdown.contains(target) && !groupeButton) {
        this.showDropdown = false;
      }
  
      // Fermer le dropdown des zones
      const zonesDropdown = this.zonesDropdown?.nativeElement as HTMLDetailsElement;
      const zonesDropdownContent = document.getElementById('zonesDropdownContent');
      if (
        zonesDropdown &&
        this.isZonesDropdownOpen &&
        !zonesDropdown.contains(target) &&
        (!zonesDropdownContent || !zonesDropdownContent.contains(target))
      ) {
        this.isZonesDropdownOpen = false;
        zonesDropdown.open = false;
        console.log('Zones dropdown closed');
      }    }
      toggleStatusArrow(isOpen: boolean) {
        this.isStatusArrowRotated = isOpen;
        this.isGenreArrowRotated = isOpen;
      }
}
