import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddProduitFormComponent } from '../../add/add-produit-form/add-produit-form.component';
import { ProduitService } from '../../../services/produit.service';
import { FicheService } from '../../../services/fiche.service';
import { ZoneService } from '../../../services/zone.service';
import { Produit } from '../../../models/Produit';
import { Zone } from '../../../models/Zone';
import { User } from '../../../models/User';
import { Fiche, FicheAction, FicheStatus } from '../../../models/Fiche';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-update-fiche',
  standalone: true,
  imports: [ FormsModule,ReactiveFormsModule,CommonModule,AddProduitFormComponent],
  templateUrl: './update-fiche.component.html',
  styleUrl: './update-fiche.component.css'
})
export class UpdateFicheComponent {
 constructor(private produitService: ProduitService,private zoneService: ZoneService,private FicheService: FicheService) {}

  @Output() close = new EventEmitter<void>();
  @Input( ) fiche!: Fiche;
  successMessage: string = '';
  errorMessage = '';
  selectedProduit: Produit | null = null; // Produit sélectionné
  showProduitDropdown = false;
  showZoneDropdown = false;
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  produitSearch = '';
  produitNames: string[] = [];
  zones : Zone []=[];
  filteredZones: Zone[] = [];
  zoneSearch = '';
  zoneNames: string[] = [];
  userConnected !: User;
  Form !: FormGroup ;
  selectedFileName : string = '';
  showAddProduitForm = false;
  newProduit : String = ''

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
    this.loadProduits();
    this.loadZones();


    this.Form = new FormGroup({
      produit: new FormControl(this.fiche.produit, [Validators.required]),
      zone: new FormControl(this.fiche.zone, [Validators.required]),
      fichier: new FormControl(null),
    });

    this.produitSearch = `${this.fiche.produit.nomProduit} ${this.fiche.produit.ref} - ${this.fiche.produit.indice}`;
    this.zoneSearch = this.fiche.zone.nom;
}

  loadProduits() {
    this.produitService.getAll().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits; // Initialiser avec tous les produits
      this.produitNames = produits.map(produit => `${produit.nomProduit} ${produit.ref} - ${produit.indice}`);
    });
  }
  loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;
      this.filteredZones = zones; // Initialiser avec tous les zones
      this.zoneNames= zones.map(zone => zone.nom);
    });
  };

  // Gérer l'événement de saisie dans l'input
  onProduitSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.produitSearch = value;
    console.log(this.produitNames);
    console.log(this.produitSearch);
    if (!this.produitSearch) {
      this.filteredProduits = this.produits; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }
    this.filteredProduits = this.produits.filter(p =>
      p.nomProduit.toLowerCase().includes(this.produitSearch.toLowerCase()) ||
      String(p.ref).toLowerCase().includes(this.produitSearch.toLowerCase()) ||
      String(p.indice).toLowerCase().includes(this.produitSearch.toLowerCase())
    );
    
    this.showProduitDropdown = true; // Afficher la liste déroulante
  }
  // Sélectionner un produit dans la liste déroulante
  selectProduit(produit: Produit) {
    this.Form.get('produit')?.setValue(produit);
    console.log('✅ Produit sélectionné :', produit);
    this.produitSearch = `${produit.nomProduit} ${produit.ref} - ${produit.indice}`;
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    this.showProduitDropdown = false; // Fermer le dropdown

  }
  // Basculer l'affichage du dropdown
  toggleProduitDropdown() {
    this.showZoneDropdown = false;
    this.showProduitDropdown = !this.showProduitDropdown;
    if (this.showProduitDropdown) {
      this.filteredProduits=this.produits;
    }
  }
  // Gérer l'événement de saisie dans l'input
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
  // Sélectionner un produit dans la liste déroulante
  selectZone(zone : Zone) {
    this.Form.get('zone')?.setValue(zone);
    console.log('✅ Zone sélectionné :', zone);
    this.zoneSearch = zone.nom;
    console.log('✅ Zone sélectionné :', this.Form.get('zone')?.value);
    this.showZoneDropdown = false; // Fermer le dropdown

  }
  // Basculer l'affichage du dropdown
  toggleZoneDropdown() {
    this.showProduitDropdown = false;
    this.showZoneDropdown = !this.showZoneDropdown;
    if (this.showZoneDropdown) {
      this.filteredZones=this.zones;
    }
  }
  clearProduitSearch() {
    this.produitSearch = '';
    this.Form.get('produit')?.setValue(null);
    this.filteredProduits = this.produits;
    this.showProduitDropdown = false;
  }
  clearZoneSearch() {
    this.zoneSearch = '';
    this.Form.get('zone')?.setValue(null);
    this.filteredZones = this.zones;
    this.showZoneDropdown = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFileName = input.files[0].name;
      this.Form.get('fichier')?.setValue(input.files[0]);
    }
  }

  @HostListener('document:click', ['$event'])
    closeDropdown(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const dropdown = document.getElementById(`dropdownProduit`);
      const button = target.closest('produit-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showProduitDropdown  && dropdown && !dropdown.contains(target) && !button) {
        this.showProduitDropdown = false; 
      }// Ferme le dropdown
      const dropdown1 = document.getElementById(`dropdownZone`);
      const button1 = target.closest('zone-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showZoneDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
        this.showZoneDropdown = false; // Ferme le dropdown
      }
  }

  onSubmit() {
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    console.log('✅ Zone sélectionnée :', this.Form.get('zone')?.value);
    console.log('✅ Fichier sélectionné :', this.Form.get('fichier')?.value);
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;
      if(produit != this.fiche.produit || zone != this.fiche.zone || file != null){ 
        const fiche = { ...this.fiche };
        fiche.produit = produit;
        fiche.zone = zone;
        console.log(fiche);
        if(file){
          this.FicheService.uploadPDF( file).subscribe({
            next: (response) => {
              console.log('Fichier pdf stocker avec succès !', response);
              fiche.pdf = response.fileName;
              fiche.status = FicheStatus.PENDING;
              this.updateFiche(fiche);
            },
            error: (err) => {
              console.error('Erreur lors de la modification de la fiche !', err);
            }
          });
        }else{
          this.updateFiche(fiche);
        }
      }
      
    } else {
      console.warn('Formulaire invalide.');
      this.Form.markAllAsTouched();
    }
  }

  updateFiche(fiche: Fiche) {
    this.FicheService.updateFiche(fiche).subscribe({
      next: (response) => {
        console.log('Fichier attaché avec succès', response);
        this.successMessage = `Fiche d'instruction modifié avec succès !`;
        this.errorMessage=''
        setTimeout(() => {
          this.close.emit(); 
          this.successMessage = '';
        }, 1000);
      
      },
      error: (err) => { 
        this.successMessage = '';
        console.error('Erreur lors de l’upload du fichier', err)
        this.errorMessage = 'Une erreur inattendue est survenue.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 1000);
      }
    });
  }
  onProduitAdded(produit: Produit) {
    // Ajouter le produit à la liste locale
    this.produits.push(produit);
    this.filteredProduits = this.produits;
    this.Form.get('produit')?.setValue(produit);
    this.produitSearch = `${produit.nomProduit} ${produit.ref} - ${produit.indice}`;
    this.produitNames.push(this.produitSearch);
  }

  initAddProduit() {
    console.log(this.produitSearch)
    this.newProduit = this.produitSearch;
    this.showAddProduitForm = true;
  }

  closeAddForm() {
    this.showAddProduitForm = false;
  }
  closeForm() {
    this.close.emit();
  }
  
}
