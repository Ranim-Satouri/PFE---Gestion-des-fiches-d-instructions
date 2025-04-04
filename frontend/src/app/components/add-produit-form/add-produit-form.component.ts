import { Component,EventEmitter,HostListener,inject,Input,Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, FormBuilder,FormControl,FormGroup,ReactiveFormsModule,ValidationErrors,ValidatorFn,Validators} from '@angular/forms';
import { FamilleService } from '../../services/famille.service';
import { Famille } from '../../models/Famille';
import { User } from '../../models/User';
import { ProduitService } from '../../services/produit.service';
import { Produit } from '../../models/Produit';

@Component({
  selector: 'app-add-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-produit-form.component.html',
  styleUrl: './add-produit-form.component.css'
})
export class AddProduitFormComponent {
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
  @Input() newProduit !: String ; // nrecuperi el nom produit mel form add fiche
  productForm!: FormGroup;
  @Output() produitAdded = new EventEmitter<Produit>(); // au cas jey mel add fiche awka yabaathlou el produit kif yetzed
  formSubmitted = false; // bech les erreurs yettafichew keen ba3d ma yenzel aal button enregistrer

 
  ngOnInit() { 
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.productForm = new FormGroup({
      nom: new FormControl(this.newProduit ?? '', []),  // <-- ici on utilise l'@Input()
      reference: new FormControl('', [Validators.required]),
      indice: new FormControl('', [Validators.required]),
      famille: new FormControl('', [Validators.required])
    });
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
    this.familleService.addFamille(newFamille , this.userConnected.idUser).subscribe({
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
      const produit : Produit = {
        nomProduit: this.productForm.value.nom,
        ref: this.productForm.value.reference,
        indice: this.productForm.value.indice,
        famille: this.productForm.value.famille,
        actionneur: this.userConnected
      };
  
      const famille: Famille = this.productForm.value.famille;
      const idFamille = famille.idFamille!;
      const idActionneur = this.userConnected.idUser!; // à récupérer dynamiquement selon ton app
  
      this.produitService.addProduit(produit, idFamille, idActionneur).subscribe({
        next: (response) => {
          console.log('Produit ajouté avec succès', response);
          this.successMessage = `Produit "${response.nomProduit}" ajouté avec succès !`;
          this.errorMessage=''
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
          if(this.newProduit){
            this.produitAdded.emit(response); // <-- ICI on retourne le produit au parent
            this.close.emit(); // Fermer le popup si besoin
          }
          this.productForm.reset();
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
      });
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
  closeFamilleAlert() {
    this.successMessage = '';
  }

}
