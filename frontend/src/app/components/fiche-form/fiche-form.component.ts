import { Component ,EventEmitter, HostListener, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ProduitService} from '../../services/produit.service';
import {Produit} from '../../models/Produit';
import {ZoneService} from '../../services/zone.service';
import {Zone} from '../../models/Zone'
import {FicheService} from '../../services/fiche.service';
import { Fiche, FicheAction, FicheStatus } from '../../models/Fiche';
import { User } from '../../models/User';
@Component({
  selector: 'app-fiche-form',
  standalone: true,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule
    ],
  templateUrl: './fiche-form.component.html',
  styleUrl: './fiche-form.component.css'
})
export class FicheFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  Form = new FormGroup({
    produit: new FormControl<Produit | null>(null, Validators.required),
    zone: new FormControl<Zone | null>(null, Validators.required),
    fichier: new FormControl<File | null>(null, Validators.required),
  });
  
  closeForm() {
    this.close.emit();
  }

  
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  searchText: string = ''; // Texte de recherche
  selectedProduit: Produit | null = null; // Produit sélectionné
  showDropdown = false;
  zones : Zone []=[];
  userConnected !: User;
  constructor(private produitService: ProduitService,private zoneService: ZoneService,private FicheService: FicheService) {}

  ngOnInit() {
    this.loadProduits(); // Charger les produits lors de l'initialisation
    this.loadZones();
  }

  loadProduits() {
    this.produitService.getAll().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits; // Initialiser avec tous les produits
    });
  }
  loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;
    })};

  // Filtrer les produits en fonction du texte de recherche
  filterProduits() {
    if (!this.searchText) {
      this.filteredProduits = this.produits; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    this.filteredProduits = this.produits.filter(p =>
      p.nomProduit.toLowerCase().includes(this.searchText.toLowerCase()) // Filtrage insensible à la casse
    );
  }

  // Sélectionner un produit dans la liste déroulante
  selectProduit(produit: Produit) {
    console.log('✅ Produit sélectionné :', produit);
    this.searchText = produit.nomProduit;
    this.selectedProduit = produit; // Sauvegarder le produit sélectionné
    this.Form.get('produit')?.setValue(produit);
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    this.showDropdown = false; // Fermer le dropdown
  }

  // Gérer l'événement de saisie dans l'input
  onSearchChange() {
    this.filterProduits(); // Filtrer les produits
    this.showDropdown = true; // Afficher la liste déroulante
  }

  // Basculer l'affichage du dropdown
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterProduits(); // Filtrer au moment où le dropdown est affiché
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.Form.get('fichier')?.setValue(file);
    this.Form.get('fichier')?.markAsTouched();
  }
  onSubmit() {
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    console.log('✅ Zone sélectionnée :', this.Form.get('zone')?.value);
    console.log('✅ Fichier sélectionné :', this.Form.get('fichier')?.value);
    if (this.Form.valid) {
      this.submit.emit(this.Form.value);
      
      const produit: Produit = this.Form.get('produit')?.value as Produit;
      const zone: Zone = this.Form.get('zone')?.value as Zone;
      const file: File = this.Form.get('fichier')?.value as File;
      const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
  
    const fiche : Fiche = {
      status: FicheStatus.PENDING,
      commentaire: '',
      ficheAQL: '',
      pdf: '',
      expirationDate: new Date(),
      action: FicheAction.INSERT,
      produit: produit,
      zone: zone,
      preparateur: this.userConnected,
      ipdf: this.userConnected,
      iqp: this.userConnected,
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
            },
            error: (err) => { 
              console.error('Erreur lors de l’upload du fichier', err)

            }
          });
          // this.pdfFilename = response.pdf; // si backend renvoie un nom ou une URL
          this.Form.reset();
          // this.searchText = '';
          // this.selectedProduit = null;
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
     
}
