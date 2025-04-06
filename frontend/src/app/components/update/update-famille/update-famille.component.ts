import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Famille } from '../../../models/Famille';
import { User } from '../../../models/User';
import { FamilleService } from '../../../services/famille.service';

@Component({
  selector: 'app-update-famille',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-famille.component.html',
  styleUrl: './update-famille.component.css'
})
export class UpdateFamilleComponent {
  constructor(private familleService: FamilleService) {}
  @Input() famille!: Famille;
  @Output() close = new EventEmitter<void>();
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  familyForm !: FormGroup;
  newFamille !: Famille;
  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.familyForm  =  new FormGroup({
      nom: new FormControl( this.famille.nomFamille,[ Validators.required])
    });
  }

  onSubmit() {
    if (this.familyForm.valid) {
      
      if(this.familyForm.value.nom !== this.famille.nomFamille){
        this.newFamille = { ...this.famille }; // bech yaaml copie mennou ma yekhouhouchhowa bidou , kahter ayy changement ysir fi hedha ysir fi hedhaw mech hakka lezem ysir
        this.newFamille.nomFamille = this.familyForm.value.nom;
        this.familleService.updateFamille(this.newFamille,this.newFamille.idFamille, this.userConnected.idUser!).subscribe({
          next: (famille) => {
            console.log('Famille modifiée avec succès', famille);
            this.errorMessage = '';
            this.successMessage = `Famille modifiée avec succès !`;
            this.famille.nomFamille = this.newFamille.nomFamille ;
            setTimeout(() => {
              this.successMessage = '';
              this.close.emit();
            }, 1000);
          },
          error: (err) => {
            this.successMessage = '';
            console.error('Erreur lors de l’update :', err);
           if (err.status === 409) {
              this.errorMessage = "Une famille avec ce nom existe déjà.";
            } else {
              this.errorMessage = "Une erreur inattendue est survenue.";
            }    
            setTimeout(() => {
              this.errorMessage = '';
            }, 4000);
          }
        });
      }
    } else {
      this.familyForm.markAllAsTouched();
    }
  }
  

  onClose() {
    this.close.emit();
  }
}
