import { Component ,EventEmitter, HostListener, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ProduitService} from '../../../services/produit.service';
import {Produit} from '../../../models/Produit';
import {ZoneService} from '../../../services/zone.service';
import {Zone} from '../../../models/Zone'
import {FicheService} from '../../../services/fiche.service';
import { Fiche, FicheAction, FicheLigne, FicheOperation, FicheStatus, FicheZone } from '../../../models/Fiche';
import { User } from '../../../models/User';
import { Ligne } from '../../../models/Ligne';
import { Operation } from '../../../models/Operation';
import { LigneService } from '../../../services/ligne.service';
import { OperationService } from '../../../services/operation.service';
import { UserZoneService } from '../../../services/user-zone.service';
@Component({
  selector: 'app-fiche-form',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule, CommonModule],
  templateUrl: './fiche-form.component.html',styleUrl: './fiche-form.component.css'})
export class FicheFormComponent {
  constructor(private produitService: ProduitService,private userZoneService: UserZoneService,private zoneService: ZoneService,private FicheService: FicheService , private ligneService : LigneService, private operationService: OperationService) {}

  @Output() close = new EventEmitter<void>();
  @Input( ) fiche!: FicheOperation | FicheLigne | FicheZone;
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  Form !: FormGroup ;
  isEditMode: boolean = false;
  updated : boolean = false;

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

  zoneSelected: boolean = false;
  ligneSelected: boolean = false;
  operationSelected: boolean = false;
  produitSelected: boolean = false;


  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.loadProduits();
    //this.loadZones();
    this.loadOperations();
    this.loadLignes();

    if (this.fiche && this.fiche.idFiche) {
      this.isEditMode = true;
      this.zoneSelected = true;
      this.ligneSelected = true;
      this.produitSearch = `${this.fiche.produit.nomProduit} ${this.fiche.produit.ref} - ${this.fiche.produit.indice}`;

      if (this.fiche.typeFiche === 'OPERATION') {
        this.zoneSearch = this.fiche.operation?.ligne?.zone?.nom || '';
        this.ligneSearch = this.fiche.operation?.ligne?.nom || '';
        this.operationSearch = this.fiche.operation?.nom || '';

        this.Form = new FormGroup({
          produit: new FormControl(this.fiche.produit, [Validators.required]),
          zone: new FormControl(this.fiche.operation?.ligne?.zone, [Validators.required]),
          ligne: new FormControl(this.fiche.operation?.ligne, [Validators.required]),
          operation: new FormControl(this.fiche.operation, [Validators.required]),
          fichier: new FormControl(null),
        });
      } else if (this.fiche.typeFiche === 'ZONE') {
        this.zoneSearch = this.fiche.zone?.nom || '';
        this.ligneSearch = '';
        this.operationSearch = '';

        this.Form = new FormGroup({
          produit: new FormControl(this.fiche.produit, [Validators.required]),
          zone: new FormControl(this.fiche.zone, [Validators.required]),
          ligne: new FormControl('', []),
          operation: new FormControl('', []),
          fichier: new FormControl(null),
        });
      } else if (this.fiche.typeFiche === 'LIGNE') {
        this.zoneSearch = this.fiche.ligne?.zone?.nom || '';
        this.ligneSearch = this.fiche.ligne?.nom || '';
        this.operationSearch = '';

        this.Form = new FormGroup({
          produit: new FormControl(this.fiche.produit, [Validators.required]),
          zone: new FormControl(this.fiche.ligne?.zone, [Validators.required]),
          ligne: new FormControl(this.fiche.ligne, [Validators.required]),
          operation: new FormControl('', []),
          fichier: new FormControl(null),
        });
      }
    } else {
      console.log('Aucune fiche trouvée, mode ajout activé.');
      this.isEditMode = false;
      this.Form = new FormGroup({
        produit: new FormControl('', [Validators.required]),
        zone: new FormControl('', [Validators.required]),
        ligne: new FormControl('', []),
        operation: new FormControl('', []),
        fichier: new FormControl('' , [Validators.required]),
      });
    }
  }

  //load data
  loadProduits() {
    this.produitService.getAll().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits;
      this.produitNames = produits.map(produit => produit.nomProduit);
    });
  }
  loadLignes() {
    this.ligneService.getAll().subscribe(lignes => {
      this.lignes = lignes;
      this.filteredLignes = lignes;
      this.ligneNames= lignes.map(ligne => ligne.nom);
  })};
  loadOperations() {
    this.operationService.getAll().subscribe(operations => {
      this.operations = operations;
      this.filteredOperations = operations; // Initialiser avec tous les operations
      this.operationNames= operations.map(operation => operation.nom);
  })};
  loadZones() {
    console.log(this.userConnected.idUser!);
    if(this.userConnected.groupe?.nom === "SUPERUSER"){
      console.log('superuser');
      this.zoneService.getAll().subscribe(zones => {
        this.zones = zones;
        this.filteredZones = zones;
        this.zoneNames= zones.map(zone => zone.nom);
      })
    }else{
      console.log('mech superuser');
      this.userZoneService.getUserZones(this.userConnected.idUser!).subscribe(userZones => {
        const zones = userZones.map(zone => zone.zone);
        this.zones = zones;
        this.filteredZones = zones;
        this.zoneNames= zones.map(zone => zone.nom);
      })
    }
};

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
    this.produitSearch = `${produit.nomProduit} ${produit.ref} - ${produit.indice}`;
    this.showProduitDropdown = false;
    this.updated = true;
    if(this.produitSelected) {
      this.clearLigneSearch();
      this.clearOperationSearch();
      this.clearZoneSearch();
    }else{
      this.produitSelected = true;
    }
    this.zoneService.getZonesPourProduit(produit.idProduit!).subscribe(zones => {
      this.filteredZones = zones;
    });
  }
  
  selectZone(zone : Zone) {
    this.Form.get('zone')?.setValue(zone);
    this.zoneSearch = zone.nom;
    this.showZoneDropdown = false;
    if(this.zoneSelected) {
      this.clearLigneSearch();
      this.clearOperationSearch();
    }else{
      this.zoneSelected = true;
    }
    this.filteredLignes = this.lignes.filter(ligne => ligne.zone.idZone === zone.idZone);
    this.updated = true;
  }

  selectLigne(ligne : Ligne) {
    this.Form.get('ligne')?.setValue(ligne);
    this.ligneSearch = ligne.nom;
    this.showLigneDropdown = false;
    this.ligneSelected = true;
    if(this.ligneSelected) {
      this.clearOperationSearch();
    }else{
      this.ligneSelected = true;
    }
    this.filteredOperations = this.operations.filter(operation => operation.ligne.idLigne === ligne.idLigne);
    this.updated = true;

  }
  selectOperation(operation : Operation) {
    this.Form.get('operation')?.setValue(operation);
    this.operationSearch = operation.nom;
    this.showOperationDropdown = false;
    this.operationSelected = true;
    this.updated = true;

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
    //this.showLigneDropdown = !this.showLigneDropdown;
    if (!this.showLigneDropdown && this.zoneSelected) {
      this.showLigneDropdown = true;
    }else{
      this.showLigneDropdown = false;
    }
  }
  toggleOperationDropdown() {
    this.showZoneDropdown = false;
    this.showLigneDropdown = false;
    this.showProduitDropdown = false;
    //this.showOperationDropdown = !this.showOperationDropdown;

    if (!this.showOperationDropdown && this.ligneSelected) {
      this.showOperationDropdown = true;
    }else{
      this.showOperationDropdown = false;
    }
  }
  toggleZoneDropdown() {
    this.showProduitDropdown = false;
    this.showOperationDropdown = false;
    this.showLigneDropdown = false;
    this.showZoneDropdown = !this.showZoneDropdown;
    if (this.showZoneDropdown) {
    }
  }

  // clear search
  clearLigneSearch() {
    this.ligneSearch = '';
    this.Form.get('ligne')?.setValue(null);
    this.filteredLignes = this.lignes;
    this.showLigneDropdown = false;
    this.clearOperationSearch();
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
    this.zoneSelected = false;
    this.clearLigneSearch();
  }

  // selection de fiche dinstruction pdf
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.Form.get('fichier')?.setValue(file);
    this.Form.get('fichier')?.markAsTouched();
    this.updated = true;

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

  // les methodes

  getTypeFiche(): 'ZONE' | 'LIGNE' | 'OPERATION' {
    if (this.Form.value.operation) {
      return 'OPERATION';
    } else if (this.Form.value.ligne  ) {
      return 'LIGNE';
    } else if (this.Form.value.zone) {
      return 'ZONE';
    }
    throw new Error('Fiche type invalide');
  }

  addFiche() {
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;
      const ligne: Ligne = this.Form.value.ligne;
      const operation: Operation = this.Form.value.operation;

      this.FicheService.uploadPDF( file).subscribe({
        next: (response) => {
          console.log('Fichier stocker avec succès !', response);
          if (this.getTypeFiche() === 'OPERATION') {
            this.fiche  =  {
              status: FicheStatus.PENDING,
              commentaire: '',
              ficheAQL: '',
              pdf:  response.fileName,
              action: FicheAction.INSERT,
              produit: produit,
              preparateur: this.userConnected,
              ipdf: this.userConnected,
              iqp: this.userConnected,
              actionneur: this.userConnected,
              typeFiche: 'OPERATION',
              operation: operation,
            }
          } else if (this.getTypeFiche() === 'LIGNE') {
            this.fiche  =  {
              status: FicheStatus.PENDING,
              commentaire: '',
              ficheAQL: '',
              pdf: response.fileName,
              action: FicheAction.INSERT,
              produit: produit,
              preparateur: this.userConnected,
              ipdf: this.userConnected,
              iqp: this.userConnected,
              actionneur: this.userConnected,
              typeFiche: 'LIGNE',
              ligne: ligne,
            }
          } else if (this.getTypeFiche() === 'ZONE') {
            this.fiche  =  {
              status: FicheStatus.PENDING,
              commentaire: '',
              ficheAQL: '',
              pdf: response.fileName,
              action: FicheAction.INSERT,
              produit: produit,
              preparateur: this.userConnected,
              ipdf: this.userConnected,
              iqp: this.userConnected,
              actionneur: this.userConnected,
              typeFiche: 'ZONE',
              zone: zone,
            }
          }
          this.FicheService.addFiche(this.fiche).subscribe({
            next: (response) => {
              console.log('Fichier attaché avec succès', response);
              this.successMessage = `Fiche d'instruction ajouté avec succès !`;
              this.errorMessage=''
              setTimeout(() => {
                this.close.emit();
                this.successMessage = '';
              }, 2000);
              this.Form.reset();
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
    if (this.Form.valid) {
      const produit: Produit = this.Form.value.produit;
      const zone: Zone = this.Form.value.zone;
      const file: File = this.Form.value.fichier;
      const ligne: Ligne = this.Form.value.ligne;
      const operation: Operation = this.Form.value.operation;
      console.log('produit', produit);
      console.log('zone', zone);
      console.log('ligne', ligne);
      console.log('operation', operation);
      console.log('fiche', this.fiche);
      console.log('boolean', produit != this.fiche.produit || zone != this.fiche.zone || ligne != this.fiche.ligne || operation != this.fiche.operation);
      if(this.updated){
        if (this.getTypeFiche() === 'ZONE') {
          this.fiche = {
            ...this.fiche,
            produit: produit,
            actionneur: this.userConnected,
            typeFiche: 'ZONE',
            zone: zone
          } as FicheZone;
        } else if (this.getTypeFiche() === 'LIGNE') {
          this.fiche = {
            ...this.fiche,
            produit: produit,
            actionneur: this.userConnected,
            typeFiche: 'LIGNE',
            ligne: ligne,  // Spécifique à FicheLigne
          } as FicheLigne;
        } else if (this.getTypeFiche() === 'OPERATION') {
          this.fiche = {
            ...this.fiche,
            produit: produit,
            actionneur: this.userConnected,
            typeFiche: 'OPERATION',
            operation: operation,  // Spécifique à FicheOperation
          } as FicheOperation;
        }
        if(file){
          this.FicheService.uploadPDF(file).subscribe({
            next: (response) => {
              console.log('Fichier pdf stocker avec succès !', response);
              this.fiche.pdf = response.fileName;
              this.fiche.status = FicheStatus.PENDING;
              this.updateFiche();
            },
            error: (err) => {
              console.error('Erreur lors de la modification de la fiche !', err);
            }
          });
        }else{
          this.updateFiche();
        }
      }else{
        this.close.emit();
      }

    } else {
      console.warn('Formulaire invalide.');
      this.Form.markAllAsTouched();
    }
  }
  updateFiche() {
    this.FicheService.updateFiche(this.fiche).subscribe({
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

