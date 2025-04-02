import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Famille } from '../../models/Famille';
import { User } from '../../models/User';
import { FamilleService } from '../../services/famille.service';

@Component({
  selector: 'app-add-famille-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-famille-form.component.html',
  styleUrl: './add-famille-form.component.css'
})
export class AddFamilleFormComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private familleService: FamilleService) {}
  //@Output() familyAdded = new EventEmitter<{ name: string }>();
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';


  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
  }

  familyForm : FormGroup =  new FormGroup({
    nom: new FormControl( '',[ Validators.required])
  });
  onSubmit() {
    if (this.familyForm.valid) {
      const newFamille: Famille = {
        nomFamille: this.familyForm.value.nom,
        actionneur: this.userConnected
      };
  
      this.familleService.addFamille(newFamille, this.userConnected.idUser).subscribe({
        next: (famille) => {
          this.errorMessage = '';
          this.successMessage = `Famille "${famille.nomFamille}" ajoutée avec succès !`;
  
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
  
          this.familyForm.reset();
        },
        error: (err) => {
          this.successMessage = '';
          console.error('Erreur lors de l’ajout :', err);
  
          if (err.status === 404) {
            this.errorMessage = "Actionneur introuvable. Veuillez vous reconnecter.";
          } else if (err.status === 409) {
            this.errorMessage = "Une famille avec ce nom existe déjà.";
          } else {
            this.errorMessage = "Une erreur inattendue est survenue.";
          }
  
          setTimeout(() => {
            this.errorMessage = '';
          }, 4000);
        }
      });
    } else {
      this.familyForm.markAllAsTouched();
    }
  }
  

  onClose() {
    this.close.emit();
  }
}
