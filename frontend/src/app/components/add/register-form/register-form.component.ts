import {Component, EventEmitter, Output, inject, HostListener, ViewChild, ElementRef, Input} from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder, FormArray} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';
import {UserService} from '../../../services/user.service';
import {Genre, Role, User, UserStatus} from '../../../models/User';
import {Groupe} from '../../../models/Groupe';
import {GroupeService} from '../../../services/groupe.service';
import { error, group } from 'console';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-register-form',standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',})
export class RegisterFormComponent {
  @ViewChild('groupeInput', { static: false }) groupeInput!: ElementRef;
  @ViewChild('groupeDropdown', { static: false }) groupeDropdown!: ElementRef;
  //event pour l'update
  @Input() userToUpdate: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  constructor(private userService:UserService,private zoneService: ZoneService,private groupeService: GroupeService) {}
  alreadyExist : Boolean = false;

  userConnected !: User;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {this.userConnected = JSON.parse(userFromLocalStorage);}
    this.loadZones();
    this.loadGroupes(); // Charger les groupes depuis le backend
    }
  loadGroupes() {
    this.groupeService.getAll().subscribe({
      next: (groupes) => {
        this.groupes = groupes;
        this.filteredGroupes = this.groupes;
        console.log('Groupes chargés depuis le backend:', this.groupes);}, error: (error) => { console.error('Erreur lors du chargement des groupes:', error);}}); }

    steps = ["Informations Personnelles", "Coordonnées", "Profil Utilisateur"];
    currentStep = 1;
    showDropdown = false;
    // Liste des zones
    zones: Zone[] = [];
    groupes: Groupe[] = [];
    selectedGroupe: Groupe | null | undefined;
    filteredGroupes: Groupe[] = [];
    searchText:string ="" ;
    filteredRoles: Role[] = [];
    role?:Role;
    private fb =inject(FormBuilder);
  // Définition du formulaire
    registerForm : FormGroup =this.fb.group({
    nom: ['', Validators.required],
    prenom: ['',Validators.required],
    matricule : ['',Validators.required],
    email : ['',Validators.required],
    numero :[''],
    genre: [''],
    role: [''] ,
    zones: this.fb.array([])  ,  status : [''] ,
    groupe: [null], });
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
            groupe: this.userToUpdate.groupe || null,
            status: this.userToUpdate.status || ''    });

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
              zonesArray.push(this.fb.control(zone.idZone)); });
          }
          console.log('Form value after patchValue:', this.registerForm.value);
        }
  }
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
  onSearchChange(value: string) {
    this.searchText = value;
    this.filteredGroupes = this.groupes.filter(groupe =>
      groupe.nom.toLowerCase().includes(value.toLowerCase())
    ); this.showDropdown = true;
     }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterGroupes();
      this.adjustDropdownPosition();
    }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropDown`);
    const button = target.closest('button[data-dropdown-toggle]');
    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showDropdown !== null && dropdown && !dropdown.contains(target) && !button) { this.showDropdown = false; }}
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
  closeForm() { this.close.emit(); }
  //l update
  updateUser() {
    if (!this.userToUpdate || !this.userToUpdate.idUser) {
      console.error('Utilisateur à mettre à jour non défini ou ID manquant');
      this.showFailAlert(); // Alerte d'échec si userToUpdate est invalide
      return;
    }if (!this.userConnected || !this.userConnected.idUser) {
      console.error('Utilisateur connecté non défini ou ID manquant');
      return;
    }
    const groupeValue = this.registerForm.get('groupe')?.value;
    console.log('Valeur du contrôle groupe avant mise à jour :', groupeValue);
    const updatedUser: User = {
      ...this.userToUpdate,
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      matricule: this.registerForm.value.matricule,
      email: this.registerForm.value.email,
      num: this.registerForm.value.numero,
      genre: this.registerForm.value.genre.toUpperCase(),
      role: this.registerForm.value.role ? this.registerForm.value.role.toUpperCase() : null,
      groupe: groupeValue && typeof groupeValue === 'object' && groupeValue.idGroupe ? groupeValue : null, status: this.registerForm.value.status,
      zones: this.registerForm.value.zones.map((zoneId: number) => ({ idZone: zoneId } as Zone))};

      const idActionneur = this.userConnected.idUser!;
      const selectedGroupe = this.registerForm.get('groupe')?.value;
      const previousGroupe = this.userToUpdate.groupe;

      // Vérifier si le groupe a changé (en tenant compte que les deux peuvent être null)
      if ( selectedGroupe?.idGroupe !== previousGroupe?.idGroupe &&
        (selectedGroupe || previousGroupe) // S'assurer qu'au moins l'un des deux est défini
      ) {
        this.userService.attribuerGroupe(this.userToUpdate.idUser, selectedGroupe?.idGroupe || null, idActionneur).subscribe({
          next: () => {
            console.log('✅ Groupe mis à jour avec succès');
            this.userUpdated.emit();

          },
          error: (error) => {
            console.error('❌ Erreur lors de la mise à jour du groupe', error);
            this.showFailAlert();
          }
        });}
    this.userService.updateUser(this.userToUpdate.idUser, updatedUser, idActionneur).subscribe({
      next: (response) => {
        console.log('✅ Utilisateur mis à jour avec succès', response);
        this.showSuccessAlert = true; // Alerte de succès pour la mise à jour de l'utilisateur
        // Compare old zones with new zones
        const oldZoneIds = this.userToUpdate!.zones?.map(zone => zone.idZone) || [];
        const newZoneIds = this.registerForm.get('zones')?.value || [];

        // Zones to remove (in old but not in new)
        const zonesToRemove = oldZoneIds.filter(zoneId => !newZoneIds.includes(zoneId));
        // Zones to add (in new but not in old)
        const zonesToAdd = newZoneIds.filter((zoneId: number) => !oldZoneIds.includes(zoneId));

        // Remove zones
        let removeObservables = zonesToRemove.map(zoneId => {
          if (zoneId !== undefined) { return this.userService.removeZone(this.userToUpdate!.idUser!, zoneId, idActionneur);}
          return null;
        }).filter(obs => obs !== null);

        // Chain the removal of zones
        if (removeObservables.length > 0) {
          forkJoin(removeObservables).subscribe({
            next: () => {
              console.log('✅ Zones supprimées avec succès');
              this.addZones(zonesToAdd, idActionneur); },
            error: (error: any) => {
              console.error('❌ Erreur lors de la suppression des zones', error);
            }});} else {
          // If no zones to remove, proceed to add new zones
          this.addZones(zonesToAdd, idActionneur);
          } },
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
          // this.userUpdated.emit();
          this.showAlertAndClose();  },
        error: (error) => {
          this.showFailAlert();
          console.error('❌ Erreur lors de l\'ajout des zones', error);}
      });
    } else {
      // If no zones to add, emit events to close the form
      this.userUpdated.emit();this.showAlertAndClose(); }}
  // Soumettre le formulaire
  submitForm() {
    if (this.userToUpdate) { this.updateUser(); }
    else {
      this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const user: any = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        genre: this.registerForm.value.genre.toUpperCase(),
        email: this.registerForm.value.email,
        matricule: this.registerForm.value.matricule,
        password: "123456",
        num: this.registerForm.value.numero,
        actionneur: this.userConnected.idUser!,
        status: this.registerForm.value.status,
        role:  "ADMIN",
        // modifieLe: new Date(),
      };
      const idActionneur = this.userConnected.idUser!;
      // Passer l'ID de l'actionneur dans la requête
      this.userService.Register(user, idActionneur).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur ajouté avec succès', response);
          const selectedGroupe = this.registerForm.get('groupe')?.value;
          if (selectedGroupe && selectedGroupe.idGroupe) {
            console.log("groupe",this.searchText);
            this.userService.attribuerGroupe(response.user.idUser, selectedGroupe.idGroupe, idActionneur).subscribe({
              next: () => {
                console.log('✅ Groupe attribué avec succès');
                this.assignZones(response.user.idUser, idActionneur);
              },
              error: (error) => {
                this.showFailAlert();
                console.error('❌ Erreur lors de l\'attribution du groupe', error);
              }
            });
          } else { this.assignZones(response.user.idUser, idActionneur); }
        }, error: (error) => {
          this.alreadyExist = true;
           this.showFailAlert(); 
           console.error('❌ Erreur lors de l\'ajout de l\'utilisateur', error); }
      });
      console.log("Données soumises :", user);
    } else {
      this.showFailAlert();
      console.log("❌ Formulaire invalide !");
    }
  }
}
assignZones(userId: number, idActionneur: number) {
  const selectedZone = this.registerForm.get('zones')?.value;
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
        this.hideAlert();
        this.showFailAlert();
        console.error('❌ Erreur lors de l\'ajout des zones', error);
      }
    });
  } else { this.showAlertAndClose(); }
}
// aleeeeeeeeerrtt
showSuccessAlert: boolean = false;
showEchecAlert : boolean = false;
hideAlert(){ 
  if(this.showSuccessAlert){
    this.showSuccessAlert = false ;
  }
  if(this.showEchecAlert){
    this.showEchecAlert = false ; 
  }
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
}
