import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Operation } from '../../../models/Operation';
import { User } from '../../../models/User';
import { OperationService } from '../../../services/operation.service';
import { Ligne } from '../../../models/Ligne';
import { LigneService } from '../../../services/ligne.service';

@Component({
  selector: 'app-add-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './add-operation.component.html',
  styleUrl: './add-operation.component.css'
})
export class AddOperationComponent {
 @Output() close = new EventEmitter<void>();
  constructor(private operationService: OperationService,private ligneService : LigneService) {}
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  isNewOperation: boolean = true;
  @Input() operation !: Operation ;
  operationForm !: FormGroup ;
  select: boolean = false;
  showLigneDropdown = false;
  lignes : Ligne []=[];
  filteredLignes: Ligne[] = [];
  ligneSearch = '';
  ligneNames: string[] = [];


  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
    this.loadLignes();

    if (this.operation && this.operation.idOperation) {
      // this.ligneSearch = this.operation.ligne.nom;
      this.ligneSearch = `${this.operation.ligne.nom} ${this.operation.ligne.zone.nom}`;

      this.isNewOperation = false;
      this.operationForm = new FormGroup({
        nom: new FormControl(this.operation.nom, [Validators.required]),
        ligne: new FormControl(this.operation.ligne, [Validators.required])
      });

    } else {
      // Initialize form for new group
      this.operationForm = new FormGroup({
        nom: new FormControl('', [Validators.required]),
        ligne: new FormControl('', [Validators.required])
      });
    }
  }
  loadLignes() {
    if(this.userConnected.groupe?.nom === "SUPERUSER"){
      console.log('superuser');
      this.ligneService.getAll().subscribe(lignes => {
        this.lignes = lignes;
        this.filteredLignes = lignes; // Initialiser avec tous les lignes
        this.ligneNames= lignes.map(ligne => ligne.nom);
      });
    }else{
      console.log('mech superuser');
      this.ligneService.getLignesByUserZones(this.userConnected.idUser!).subscribe(lignes => {
        this.lignes = lignes;
        this.filteredLignes = lignes; // Initialiser avec tous les lignes
        this.ligneNames= lignes.map(ligne => ligne.nom);
    })};
  }


  addOperation() {
    if (this.operationForm.valid) {
      const newOperation: Operation = {
        nom: this.operationForm.value.nom,
        actionneur: this.userConnected,
        ligne: this.operationForm.value.ligne,
      };
      console.log('Nouvelle operation:', newOperation);
      this.operationService.addOperation(newOperation, this.userConnected.idUser!).subscribe({
        next: (operation) => {
          this.operation = operation;
          this.errorMessage = '';
          this.successMessage = `Operation "${operation.nom}" ajoutée avec succès !`;
  
          setTimeout(() => {
            this.close.emit();
             this.successMessage = '';
          }, 1000);
  
          //this.isNewOperation = false;
         
        },
        error: (err) => {
          this.successMessage = '';
          console.error('Erreur lors de l’ajout :', err);
  
          if (err.status === 404) {
            this.errorMessage = "Actionneur introuvable";
          } else if (err.status === 409) {
            this.errorMessage = "Une operation avec ce nom et ligne existe déjà.";
          } else {
            this.errorMessage = "Une erreur inattendue est survenue.";
          }
  
          setTimeout(() => {
            this.errorMessage = '';
          }, 2000);
        }
      });
    } else {
      this.operationForm.markAllAsTouched();
    }
  }
 
  
  onClose() {
    this.close.emit();
  }


  updateOperation() {
    if (this.operationForm.valid) { 
      console.log('operationForm.value.nom',this.operationForm.value.ligne.nom);
      console.log('operationForm.value.nom',this.operation.ligne.nom);
      if(this.operationForm.value.nom !== this.operation.nom || this.operationForm.value.ligne.nom + ' ' + this.operationForm.value.ligne.zone.nom  !== this.operation.ligne.nom + ' ' + this.operation.ligne.zone.nom ) {
        //this.newOperation = { ...this.operation }; // bech yaaml copie mennou ma yekhouhouchhowa bidou , kahter ayy changement ysir fi hedha ysir fi hedhaw mech hakka lezem ysir
        this.operation.nom = this.operationForm.value.nom;
        this.operation.ligne = this.operationForm.value.ligne;
        this.operationService.updateOperation(this.operation,this.operation.idOperation, this.userConnected.idUser!).subscribe({
          next: (operation) => {
            console.log('Operation modifiée avec succès', operation);
            this.errorMessage = '';
            this.successMessage = `Operation modifiée avec succès !`;
            this.operation.nom = this.operation.nom ;
            setTimeout(() => {
              this.successMessage = '';
              this.close.emit();
            }, 2000);
          },
          error: (err) => {
            this.successMessage = '';
            console.error('Erreur lors de l’update :', err);
            if (err.status === 409) {
              this.errorMessage = "Une operation avec ce nom et ligne existe déjà.";
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
      this.operationForm.markAllAsTouched();
    }
  }
  clearLigneSearch() {
    this.ligneSearch = '';
    this.operationForm.get('ligne')?.setValue(null);
    this.filteredLignes = this.lignes;
    this.showLigneDropdown = false;
  }
  toggleLigneDropdown() {
    this.showLigneDropdown = !this.showLigneDropdown;
    if (this.showLigneDropdown) {
      this.filteredLignes=this.lignes;
    }
  }
  selectLigne(ligne : Ligne) {
    this.operationForm.get('ligne')?.setValue(ligne);
    console.log('✅ Ligne sélectionné :', ligne);
    //this.ligneSearch = ligne.nom;
    this.ligneSearch = `${ligne.nom} ${ligne.zone.nom}`;
    console.log('✅ Ligne sélectionné :', this.operationForm.get('ligne')?.value);
    this.showLigneDropdown = false; // Fermer le dropdown

  }
  onLigneSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.ligneSearch = value;
    if (!this.ligneSearch) {
      this.filteredLignes = this.lignes; // Si aucun texte n'est saisi, afficher tous les produits
      return;
    }

    // this.filteredLignes = this.lignes.filter(z =>
    //   z.nom.toLowerCase().includes(this.ligneSearch.toLowerCase()) // Filtrage insensible à la casse
    // );
    this.filteredLignes = this.lignes.filter(ligne =>
      ligne.nom.toLowerCase().includes(this.ligneSearch.toLowerCase()) ||
      ligne.zone.nom.toLowerCase().includes(this.ligneSearch.toLowerCase())
    );
    this.showLigneDropdown = true; // Afficher la liste déroulante
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
  
    const dropdown1 = document.getElementById(`dropdownLigne`);
    const button1 = target.closest('ligne-input');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showLigneDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
      this.showLigneDropdown = false; 
    }
  }
  
}
