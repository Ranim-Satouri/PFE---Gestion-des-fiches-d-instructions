import { Component ,EventEmitter, HostListener, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ProduitService} from '../../../services/produit.service';
import {Produit} from '../../../models/Produit';
import {ZoneService} from '../../../services/zone.service';
import {Zone} from '../../../models/Zone'
import {FicheService} from '../../../services/fiche.service';
import { Fiche, FicheAction, FicheStatus } from '../../../models/Fiche';
import { User } from '../../../models/User';
import { AddProduitFormComponent } from "../add-produit-form/add-produit-form.component";
import { AddZoneFormComponent } from "../add-zone-form/add-zone-form.component";
@Component({
  selector: 'app-fiche-form',
  standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AddProduitFormComponent,
],
  templateUrl: './fiche-form.component.html',
  styleUrl: './fiche-form.component.css'
})
export class FicheFormComponent {
  constructor(private produitService: ProduitService,private zoneService: ZoneService,private FicheService: FicheService) {}

  @Output() close = new EventEmitter<void>();
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
  Form : FormGroup =  new  FormGroup({
    produit: new FormControl('', [Validators.required]),
    zone: new FormControl('', [Validators.required]),
    fichier: new FormControl('', [Validators.required]),
  });
  
  closeForm() {
    this.close.emit();
  }

  ngOnInit() {
    this.loadProduits(); // Charger les produits lors de l'initialisation
    this.loadZones();
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
  }

  loadProduits() {
    this.produitService.getAll().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits; // Initialiser avec tous les produits
      this.produitNames = produits.map(produit => produit.nomProduit);
    });
  }
  loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;
      this.filteredZones = zones; // Initialiser avec tous les zones
      this.zoneNames= zones.map(zone => zone.nom);
    })};

 
  // Gérer l'événement de saisie dans l'input
  onProduitSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.produitSearch = value;
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
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.Form.get('fichier')?.setValue(file);
    this.Form.get('fichier')?.markAsTouched();
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
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;

      const ipdf: any = {
        idUser : 3,
        nom: '',
        prenom: '',
        genre: "FEMME",
        email: '',
        matricule: '',
        password: "123456",  // Correction de la majuscule
        num: '',
        actionneur: this.userConnected.idUser!, // Correction de la majuscule
        status: 'ACTIVE',
        role: 'IPDF', // Ajout d'une valeur par défaut
        // zones: Array.isArray(this.registerForm.value.zones) ? this.registerForm.value.zones : [],
        // modifieLe: new Date(),
      };
      const iqp: any = {
        idUser : 4,
        nom: '',
        prenom: '',
        genre: "FEMME",
        email: '',
        matricule: '',
        password: "123456",  // Correction de la majuscule
        num: '',
        actionneur: this.userConnected.idUser!, // Correction de la majuscule
        status: 'ACTIVE',
        role: 'IQP', // Ajout d'une valeur par défaut
        // zones: Array.isArray(this.registerForm.value.zones) ? this.registerForm.value.zones : [],
        // modifieLe: new Date(),
      };
      const fiche : Fiche = {
        status: FicheStatus.PENDING,
        commentaire: '',
        ficheAQL: '',
        pdf: '',
        action: FicheAction.INSERT,
        produit: produit,
        zone: zone,
        preparateur: this.userConnected,
        ipdf: ipdf,
        iqp: iqp,
        actionneur: this.userConnected
      }
         
      console.log(fiche);
      this.FicheService.uploadPDF( file).subscribe({
        next: (response) => {
          console.log('Fichier stocker avec succès !', response);
          fiche.pdf = response.fileName;
          this.FicheService.addFiche(fiche).subscribe({
            next: (response) => {
              console.log('Fichier attaché avec succès', response);
              this.successMessage = `Fiche d'instruction ajouté avec succès !`;
            this.errorMessage=''
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
            this.Form.reset();
            // this.pdfFilename = response.pdf; // si backend renvoie un nom ou une URL
           
            this.produitSearch = '';
            this.zoneSearch = '';
            this.filteredProduits = this.produits;
            this.filteredZones = this.zones;
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
            },
            error: (err) => { 
              this.successMessage = '';
              console.error('Erreur lors de l’upload du fichier', err)
              this.errorMessage = 'Une erreur inattendue est survenue.';
              // Auto-hide message after 4s
              setTimeout(() => {
                this.errorMessage = '';
              }, 4000);
            }
          });
          
        },
        error: (err) => {
          console.error('Erreur lors de la création de la fiche !', err);
        }
      });
      
    } else {
      console.warn('Formulaire invalide.');
      this.Form.markAllAsTouched();
    }
  }

  showAddProduitForm = false;

  closeAddForm() {
    this.showAddProduitForm = false;
  }
  newProduit : String = ''
  initAddProduit() {
    console.log(this.produitSearch)
    this.newProduit = this.produitSearch;
    this.showAddProduitForm = true;
  }
  onProduitAdded(produit: Produit) {
    // Ajouter le produit à la liste locale
    this.produits.push(produit);
    this.filteredProduits = this.produits;
    this.Form.get('produit')?.setValue(produit);
    this.produitSearch = `${produit.nomProduit} (${produit.ref} - ${produit.indice})`;
    this.produitNames.push(produit.nomProduit);
  }

  createZone() {
   
    const newZone: Zone = {
      nom: this.zoneSearch,
      actionneur: this.userConnected
    };

    this.zoneService.addZone(newZone, this.userConnected.idUser!).subscribe({
      next: (zone) => {
        this.errorMessage = '';
        this.successMessage = `Zone "${zone.nom}" ajoutée avec succès !`; 
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.zones.push(zone);
        this.filteredZones = this.zones;
        this.Form.get('zone')?.setValue(zone);
        this.zoneSearch = zone.nom;
        this.zoneNames.push(zone.nom);
        this.showZoneDropdown = false; 
      },
      error: (err) => {
        this.successMessage = '';
        console.error('Erreur lors de l’ajout :', err);

        if (err.status === 404) {
          this.errorMessage = "Actionneur introuvable. Veuillez vous reconnecter.";
        } else if (err.status === 409) {
          this.errorMessage = "Une zone avec ce nom existe déjà.";
        } else {
          this.errorMessage = "Une erreur inattendue est survenue.";
        }

        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
      
  }
  
}
