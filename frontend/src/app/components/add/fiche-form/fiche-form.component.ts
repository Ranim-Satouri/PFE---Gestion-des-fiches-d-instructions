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
import { Ligne } from '../../../models/Ligne';
import { Operation } from '../../../models/Operation';
import { LigneService } from '../../../services/ligne.service';
import { OperationService } from '../../../services/operation.service';
@Component({
  selector: 'app-fiche-form', standalone: true,
  imports: [FormsModule,ReactiveFormsModule, CommonModule],
  templateUrl: './fiche-form.component.html',styleUrl: './fiche-form.component.css'})
export class FicheFormComponent {
  constructor(private produitService: ProduitService,private zoneService: ZoneService,private FicheService: FicheService , private ligneService : LigneService, private operationService: OperationService) {}

  @Output() close = new EventEmitter<void>();
  @Input() fiche!: Fiche;
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  Form !: FormGroup ;
  isEditMode: boolean = false;

  showProduitDropdown = false;
  showLigneDropdown = false;
  showOperationDropdown = false;
  showZoneDropdown = false;

  produits: Produit[] = [];
  zones : Zone []=[];
  lignes : Ligne []=[];
  operations : Operation []=[];

  filteredProduits: Produit[] = [];
  filteredZones: Zone[] = [];
  filteredLignes: Ligne[] = [];
  filteredOperations: Operation[] = [];

  produitSearch = '';
  ligneSearch = '';
  operationSearch = '';
  zoneSearch = '';

  produitNames: string[] = [];
  zoneNames: string[] = [];
  ligneNames: string[] = [];
  operationNames: string[] = [];

  ngOnInit() {
    this.loadProduits(); // Charger les produits lors de l'initialisation
    this.loadZones();
    this.loadOperations();
    this.loadLignes();
    
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }

    // Si une fiche est passée en entrée, on est en mode édition
    if (this.fiche && this.fiche.idFiche) {
      this.isEditMode = true;
      this.produitSearch = `${this.fiche.produit.nomProduit} ${this.fiche.produit.ref} - ${this.fiche.produit.indice}`;
      this.zoneSearch = this.fiche.zone.nom;
      this.ligneSearch = this.fiche.ligne.nom;
      this.operationSearch = this.fiche.operation.nom;

      // Remplir le formulaire avec les données de la fiche existante
      this.Form = new FormGroup({
        produit: new FormControl(this.fiche.produit, [Validators.required]),
        zone: new FormControl(this.fiche.zone, [Validators.required]),
        ligne: new FormControl(this.fiche.ligne, [Validators.required]),
        operation: new FormControl(this.fiche.operation, [Validators.required]),
        fichier: new FormControl(null),
      });
    } else {
      this.isEditMode = false;
      // Initialiser le formulaire pour un ajout (vide ou avec des valeurs par défaut)
      this.Form = new FormGroup({
        produit: new FormControl('', [Validators.required]),
        zone: new FormControl('', [Validators.required]),
        ligne: new FormControl('', [Validators.required]),
        operation: new FormControl('', [Validators.required]),
        fichier: new FormControl('' , [Validators.required]),});
    }
  }

  //load data
  loadProduits() {
    this.produitService.getAll().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits; // Initialiser avec tous les produits
      this.produitNames = produits.map(produit => produit.nomProduit);
    });
  }
  loadLignes() {
    this.ligneService.getAll().subscribe(lignes => {
      this.lignes = lignes;
      this.filteredLignes = lignes; // Initialiser avec tous les lignes
      this.ligneNames= lignes.map(ligne => ligne.nom);
  })};
  loadOperations() {
    this.operationService.getAll().subscribe(operations => {
      this.operations = operations;
      this.filteredOperations = operations; // Initialiser avec tous les operations
      this.operationNames= operations.map(operation => operation.nom);
  })};
  loadZones() {
    this.zoneService.getAll().subscribe(zones => {
      this.zones = zones;
      this.filteredZones = zones; // Initialiser avec tous les zones
      this.zoneNames= zones.map(zone => zone.nom);
  })};

  // Gérer l'événement de saisie dans l'input pour recherche
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
  onLigneSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.ligneSearch = value;
    if (!this.ligneSearch) {
      this.filteredLignes = this.lignes; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    this.filteredLignes = this.lignes.filter(z =>
      z.nom.toLowerCase().includes(this.ligneSearch.toLowerCase()) // Filtrage insensible à la casse
    );
    this.showLigneDropdown = true; // Afficher la liste déroulante
  }
  onOperationSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.operationSearch = value;
    if (!this.operationSearch) {
      this.filteredOperations = this.operations; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    this.filteredOperations = this.operations.filter(z =>
      z.nom.toLowerCase().includes(this.operationSearch.toLowerCase()) // Filtrage insensible à la casse
    );
    this.showOperationDropdown = true; // Afficher la liste déroulante
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

  // Gerer la selection
  selectProduit(produit: Produit) {
    this.Form.get('produit')?.setValue(produit);
    console.log('✅ Produit sélectionné :', produit);
    this.produitSearch = `${produit.nomProduit} ${produit.ref} - ${produit.indice}`;
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    this.showProduitDropdown = false; // Fermer le dropdown

  }
  selectZone(zone : Zone) {
    this.Form.get('zone')?.setValue(zone);
    console.log('✅ Zone sélectionné :', zone);
    this.zoneSearch = zone.nom;
    console.log('✅ Zone sélectionné :', this.Form.get('zone')?.value);
    this.showZoneDropdown = false; // Fermer le dropdown

  }
  selectLigne(ligne : Ligne) {
    this.Form.get('ligne')?.setValue(ligne);
    console.log('✅ Ligne sélectionné :', ligne);
    this.ligneSearch = ligne.nom;
    console.log('✅ Ligne sélectionné :', this.Form.get('ligne')?.value);
    this.showLigneDropdown = false; // Fermer le dropdown

  }
  selectOperation(operation : Operation) {
    this.Form.get('operation')?.setValue(operation);
    console.log('✅ Operation sélectionné :', operation);
    this.operationSearch = operation.nom;
    console.log('✅ Operation sélectionné :', this.Form.get('operation')?.value);
    this.showOperationDropdown = false; // Fermer le dropdown

  }

  // Basculer l'affichage du dropdown
  toggleProduitDropdown() {
    this.showZoneDropdown = false;
    this.showOperationDropdown = false;
    this.showLigneDropdown = false;
    this.showProduitDropdown = !this.showProduitDropdown;
    if (this.showProduitDropdown) {
      this.filteredProduits=this.produits;
    }
  }
  toggleLigneDropdown() {
    this.showZoneDropdown = false;
    this.showProduitDropdown = false;
    this.showOperationDropdown = false;
    this.showLigneDropdown = !this.showLigneDropdown;
    if (this.showLigneDropdown) {
      this.filteredLignes=this.lignes;
    }
  }
  toggleOperationDropdown() {
    this.showZoneDropdown = false;
    this.showLigneDropdown = false;
    this.showProduitDropdown = false;
    this.showOperationDropdown = !this.showOperationDropdown;
    if (this.showOperationDropdown) {
      this.filteredOperations=this.operations;
    }
  }
  toggleZoneDropdown() {
    this.showProduitDropdown = false;
    this.showOperationDropdown = false;
    this.showLigneDropdown = false;
    this.showZoneDropdown = !this.showZoneDropdown;
    if (this.showZoneDropdown) {
      this.filteredZones=this.zones;
    }
  }

  // clear search
  clearLigneSearch() {
    this.ligneSearch = '';
    this.Form.get('ligne')?.setValue(null);
    this.filteredLignes = this.lignes;
    this.showLigneDropdown = false;
  }
  clearOperationSearch() {
    this.operationSearch = '';
    this.Form.get('operation')?.setValue(null);
    this.filteredOperations = this.operations;
    this.showOperationDropdown = false;
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

  // selection de fiche dinstruction pdf
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
      }
      const dropdown1 = document.getElementById(`dropdownZone`);
      const button1 = target.closest('zone-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showZoneDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
        this.showZoneDropdown = false; // Ferme le dropdown
      }
      const dropdown2 = document.getElementById(`dropdownLigne`);
      const button2 = target.closest('ligne-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showLigneDropdown  && dropdown2 && !dropdown2.contains(target) && !button2) {
        this.showLigneDropdown = false; // Ferme le dropdown
      }
      const dropdown3 = document.getElementById(`dropdownOperation`);
      const button3 = target.closest('operation-input');
  
      // Vérifiez si le clic est en dehors du dropdown et du bouton
      if (this.showOperationDropdown  && dropdown3 && !dropdown3.contains(target) && !button3) {
        this.showOperationDropdown = false; // Ferme le dropdown
      }
  }

  // traitement ajout et update
  addFiche() {
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;
      const ligne: Ligne = this.Form.value.ligne;
      const operation: Operation = this.Form.value.operation;
      const fiche : Fiche = {
        status: FicheStatus.PENDING,
        commentaire: '',
        ficheAQL: '',
        pdf: '',
        action: FicheAction.INSERT,
        produit: produit,
        zone: zone,
        preparateur: this.userConnected,
        ipdf: this.userConnected,
        iqp: this.userConnected,
        actionneur: this.userConnected,
        ligne : ligne,
        operation : operation,
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
              this.close.emit();
              this.successMessage = '';
            }, 2000);
            this.Form.reset();
            // this.pdfFilename = response.pdf; // si backend renvoie un nom ou une URL
           
            // this.produitSearch = '';
            // this.zoneSearch = '';
            // this.filteredProduits = this.produits;
            // this.filteredZones = this.zones;
            // const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            // if (fileInput) {
            //   fileInput.value = '';
            // }
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
  updateFicheAndFile() {
    console.log('✅ Produit sélectionné :', this.Form.get('produit')?.value);
    console.log('✅ Zone sélectionnée :', this.Form.get('zone')?.value);
    console.log('✅ Fichier sélectionné :', this.Form.get('fichier')?.value);
    console.log('✅ Ligne sélectionnée :', this.Form.get('ligne')?.value);
    console.log('✅ Operation sélectionnée :', this.Form.get('operation')?.value);
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;
      const ligne: Ligne = this.Form.value.ligne;
      const operation: Operation = this.Form.value.operation;
      if(produit != this.fiche.produit || zone != this.fiche.zone || file != null){ 
        const fiche = { ...this.fiche };
        fiche.produit = produit;
        fiche.zone = zone;
        fiche.ligne = ligne;
        fiche.operation = operation;
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

  closeForm() {
    this.close.emit();
  }

}

