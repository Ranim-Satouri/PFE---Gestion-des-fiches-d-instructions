import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Ligne } from '../../../models/Ligne';
import { User } from '../../../models/User';
import { LigneService } from '../../../services/ligne.service';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';
@Component({
  selector: 'app-ligne-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './ligne-form.component.html',
  styleUrl: './ligne-form.component.css'
})
export class LigneFormComponent {
  @Output() close = new EventEmitter<void>();
    constructor(private ligneService: LigneService,private zoneService : ZoneService) {}
    userConnected !: User;
    successMessage: string = '';
    errorMessage = '';
    isNewLigne: boolean = true;
    @Input() ligne !: Ligne ;
    ligneForm !: FormGroup ;
    select: boolean = false;
    showZoneDropdown = false;
    zones : Zone []=[];
    filteredZones: Zone[] = [];
    zoneSearch = '';
    zoneNames: string[] = [];
  
  
    ngOnInit(){
      const userFromLocalStorage = localStorage.getItem('user');
        if (userFromLocalStorage) {
          this.userConnected = JSON.parse(userFromLocalStorage);
        }
      this.loadZones();
  
      if (this.ligne && this.ligne.idLigne) {
        this.zoneSearch = this.ligne.zone.nom;
        this.isNewLigne = false;
        this.ligneForm = new FormGroup({
          nom: new FormControl(this.ligne.nom, [Validators.required]),
          zone: new FormControl(this.ligne.zone, [Validators.required])
        });
  
      } else {
        // Initialize form for new group
        this.ligneForm = new FormGroup({
          nom: new FormControl('', [Validators.required]),
          zone: new FormControl('', [Validators.required])
        });
      }
    }
    loadZones() {
      this.zoneService.getAll().subscribe(zones => {
        this.zones = zones;
        this.filteredZones = zones; // Initialiser avec tous les zones
        this.zoneNames= zones.map(zone => zone.nom);
    })};
  
    addLigne() {
      if (this.ligneForm.valid) {
        const newLigne: Ligne = {
          nom: this.ligneForm.value.nom,
          actionneur: this.userConnected,
          zone: this.ligneForm.value.zone,
        };
        console.log('Nouvelle ligne:', newLigne);
        this.ligneService.addLigne(newLigne, this.userConnected.idUser!).subscribe({
          next: (ligne) => {
            this.ligne = ligne;
            this.errorMessage = '';
            this.successMessage = `Ligne "${ligne.nom}" ajoutée avec succès !`;
    
            setTimeout(() => {
              this.close.emit();
               this.successMessage = '';
            }, 1000);
    
            //this.isNewLigne = false;
           
          },
          error: (err) => {
            this.successMessage = '';
            console.error('Erreur lors de l’ajout :', err);
    
            if (err.status === 404) {
              this.errorMessage = "Actionneur introuvable";
            } else if (err.status === 409) {
              this.errorMessage = "Une ligne avec ce nom et zone existe déjà.";
            } else {
              this.errorMessage = "Une erreur inattendue est survenue.";
            }
    
            setTimeout(() => {
              this.errorMessage = '';
            }, 2000);
          }
        });
      } else {
        this.ligneForm.markAllAsTouched();
      }
    }
   
    
    onClose() {
      this.close.emit();
    }
  
  
    updateLigne() {
      if (this.ligneForm.valid) { 
        console.log('ligneForm.value.nom',this.ligneForm.value.zone.nom);
        console.log('ligneForm.value.nom',this.ligne.zone.nom);
        if(this.ligneForm.value.nom !== this.ligne.nom || this.ligneForm.value.zone.nom !== this.ligne.zone.nom) {
          //this.newLigne = { ...this.ligne }; // bech yaaml copie mennou ma yekhouhouchhowa bidou , kahter ayy changement ysir fi hedha ysir fi hedhaw mech hakka lezem ysir
          this.ligne.nom = this.ligneForm.value.nom;
          this.ligne.zone = this.ligneForm.value.zone;
          this.ligneService.updateLigne(this.ligne,this.ligne.idLigne, this.userConnected.idUser!).subscribe({
            next: (ligne) => {
              console.log('Ligne modifiée avec succès', ligne);
              this.errorMessage = '';
              this.successMessage = `Ligne modifiée avec succès !`;
              this.ligne.nom = this.ligne.nom ;
              setTimeout(() => {
                this.successMessage = '';
                this.close.emit();
              }, 2000);
            },
            error: (err) => {
              this.successMessage = '';
              console.error('Erreur lors de l’update :', err);
              if (err.status === 409) {
                this.errorMessage = "Une ligne avec ce nom et zone existe déjà.";
              } else {
                this.errorMessage = "Une erreur inattendue est survenue.";
              }    
              setTimeout(() => {
                this.errorMessage = '';
              }, 2000);
            }
          });
        }
      } else {
        this.ligneForm.markAllAsTouched();
      }
    }
    clearZoneSearch() {
      this.zoneSearch = '';
      this.ligneForm.get('zone')?.setValue(null);
      this.filteredZones = this.zones;
      this.showZoneDropdown = false;
    }
    toggleZoneDropdown() {
      this.showZoneDropdown = !this.showZoneDropdown;
      if (this.showZoneDropdown) {
        this.filteredZones=this.zones;
      }
    }
    selectZone(zone : Zone) {
      this.ligneForm.get('zone')?.setValue(zone);
      console.log('✅ Zone sélectionné :', zone);
      this.zoneSearch = zone.nom;
      console.log('✅ Zone sélectionné :', this.ligneForm.get('zone')?.value);
      this.showZoneDropdown = false; // Fermer le dropdown
  
    }
    onZoneSearchChange(event: Event) {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      this.zoneSearch = value;
      if (!this.zoneSearch) {
        this.filteredZones = this.zones; // Si aucun texte n'est saisi, afficher tous les produits
        return;
      }
  
      this.filteredZones = this.zones.filter(z =>
        z.nom.toLowerCase().includes(this.zoneSearch.toLowerCase()) // Filtrage insensible à la casse
      );
      this.showZoneDropdown = true; // Afficher la liste déroulante
    }
  
    @HostListener('document:click', ['$event'])
    closeDropdown(event: MouseEvent) {
      const target = event.target as HTMLElement;
    
      const dropdown1 = document.getElementById(`dropdownZone`);
      const button1 = target.closest('Zone-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showZoneDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
        this.showZoneDropdown = false; // Ferme le dropdown
      }
    }
}
