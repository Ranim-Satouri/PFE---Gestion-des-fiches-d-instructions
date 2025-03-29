import { Component ,EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ProduitService} from '../../services/produit.service';
import {Produit} from '../../models/Produit';
import {ZoneService} from '../../services/zone.service';
import {Zone} from '../../models/Zone'
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

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    matricule: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', Validators.required),
    produitId: new FormControl('', Validators.required) // Stockez l'ID plutôt que le nom
  });
  closeForm() {
    this.close.emit();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.submit.emit(this.registerForm.value);
      this.registerForm.reset();
    }
  }
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  searchText: string = ''; // Texte de recherche
  selectedProduit: Produit | null = null; // Produit sélectionné
  showDropdown = false;
  zones : Zone []=[];

  constructor(private produitService: ProduitService,private zoneService: ZoneService) {}

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
    this.searchText = produit.nomProduit;
    this.selectedProduit = produit; // Sauvegarder le produit sélectionné
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
}
