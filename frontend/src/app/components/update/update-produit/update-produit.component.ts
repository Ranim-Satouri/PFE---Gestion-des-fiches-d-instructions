import { Component,EventEmitter,HostListener,inject,Input,Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, FormBuilder,FormControl,FormGroup,ReactiveFormsModule,ValidationErrors,ValidatorFn,Validators} from '@angular/forms';
import { FamilleService } from '../../../services/famille.service';
import { ProduitService } from '../../../services/produit.service';
import { Famille } from '../../../models/Famille';
import { User } from '../../../models/User';
import { Produit } from '../../../models/Produit';

@Component({
  selector: 'app-update-produit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-produit.component.html',
  styleUrl: './update-produit.component.css'
})
export class UpdateProduitComponent {
constructor(private familleService: FamilleService,private produitService: ProduitService) {}
  @Output() close = new EventEmitter<void>();
  families: Famille[] = [];
  familleNames: string[] = [];
  filteredFamilles: Famille[] = [];
  familleSearch = '';
  showDropdown = false;
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  @Input() produit!: Produit; // nrecuperi el produit mel listfiche bech na3mallou update
  productForm!: FormGroup;
  formSubmitted = false; // bech les erreurs yettafichew keen ba3d ma yenzel aal button enregistrer
  newProduit!: Produit; 

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    console.log(this.produit);
    this.productForm = new FormGroup({
      nom: new FormControl(this.produit.nomProduit, []), 
      reference: new FormControl(this.produit.ref, [Validators.required]),
      indice: new FormControl(this.produit.indice, [Validators.required]),
      famille: new FormControl(this.produit.famille, [Validators.required])
    });
    this.familleSearch = this.produit.famille.nomFamille;
    this.getFamilles();
  }
  getFamilles() {
      this.familleService.getAll().subscribe({
        next : (response :Famille[]) => {
          this.families = response;
          this.familleNames = response.map(famille => famille.nomFamille);
        },
        error : (error : any) => {
          console.error('fetching familles error:', error);
        }
      });
  }

  onFamilleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.familleSearch = value;
    this.filteredFamilles = this.families.filter(f =>
      f.nomFamille.toLowerCase().includes(value.toLowerCase())
    );
    this.showDropdown = true;
  }

  selectFamille(famille: Famille) {
    this.productForm.get('famille')?.setValue(famille);
    this.familleSearch = famille.nomFamille;
    this.showDropdown = false;
  }

  addFamille(nom: string) {
    const newFamille: Famille = {
      nomFamille: nom,
      actionneur : this.userConnected
    };
    this.familleService.addFamille(newFamille , this.userConnected.idUser!).subscribe({
      next: (famille) => {
        console.log('Famille ajoutée :', famille);
        this.errorMessage='';
        this.successMessage = `Famille "${famille.nomFamille}" ajouté avec succès !`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.families.push(famille); // Mets à jour ta liste
        this.familleNames.push(nom);
        this.selectFamille(famille); // Si besoin de lier à ton formulaire
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout :', err);
      }
    });
  }
  clearFamilleSearch() {
    this.familleSearch = '';
    this.productForm.get('famille')?.setValue(null);
    this.filteredFamilles = this.families;
    this.showDropdown = false;
  }


  onSubmit() {
    this.formSubmitted = true;
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {
        if(this.productForm.value.famille != this.produit.famille || this.productForm.value.nom != this.produit.nomProduit || this.productForm.value.reference != this.produit.ref || this.productForm.value.indice != this.produit.indice){
          const produit : Produit = {
            idProduit: this.produit.idProduit,
            nomProduit: this.productForm.value.nom,
            ref: this.productForm.value.reference,
            indice: this.productForm.value.indice,
            famille: this.productForm.value.famille,
            actionneur: this.userConnected
          };
    
          const idActionneur = this.userConnected.idUser!; 
          this.produitService.updateProduit(produit, produit.famille.idFamille! ,this.produit.idProduit, idActionneur).subscribe({
            next: (response) => {
              this.successMessage = `Produit modifié avec succès !`;
              this.errorMessage=''
              setTimeout(() => {
                this.close.emit(); 
                this.successMessage = '';
              }, 1000);
            },
            error: (err) => {
              this.successMessage = '';
              console.error('Erreur backend:', err);
    
              if (err.status === 404) {
                if (err.error === 'Famille introuvable') {
                  this.errorMessage = 'La famille sélectionnée est introuvable.';
                } else if (err.error === 'Actionneur introuvable') {
                  this.errorMessage = 'Utilisateur non autorisé à effectuer cette action.';
                } else {
                  this.errorMessage = 'Ressource introuvable.';
                }
              } else if (err.status === 409) {
                this.errorMessage = 'Un produit avec le même indice et référence existe déjà.';
              } else {
                this.errorMessage = 'Une erreur inattendue est survenue.';
              }
    
              // Auto-hide message after 4s
              setTimeout(() => {
                this.errorMessage = '';
              }, 4000);
            }
          });}
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  toggleDropdown() {
    this.filteredFamilles = this.families
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('dropdown');
    const input = document.getElementById('famille-input');

    // Si le clic n'est ni sur le champ input, ni dans le dropdown
    if (this.showDropdown && dropdown && !dropdown.contains(target) && input && !input.contains(target)) {
      this.showDropdown = false;
      this.filteredFamilles = [];
    }
  }
 
}
