import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserZoneAssignComponent } from "../../user-zone-assign/user-zone-assign.component";
import { Zone } from '../../../models/Zone';
import { CommonModule } from '@angular/common';
import { ZoneService } from '../../../services/zone.service';
import { User } from '../../../models/User';

@Component({
  selector: 'app-add-zone-form',
  standalone: true,
  imports: [ReactiveFormsModule, UserZoneAssignComponent,CommonModule],
  templateUrl: './add-zone-form.component.html',
  styleUrl: './add-zone-form.component.css'
})
export class AddZoneFormComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private zoneService: ZoneService) {}
  showAffectation : boolean = false;
  createdZone: Zone | null = null;
  userConnected !: User;
  successMessage: string = '';
  successMessage1: string = '';
  errorMessage = '';
  
  zoneForm : FormGroup =  new FormGroup({
    nom: new FormControl( '',[ Validators.required])
  });


  createZone(assignAfterCreate: boolean) {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    if (this.zoneForm.valid) {
          const newZone: Zone = {
            nom: this.zoneForm.value.nom,
            actionneur: this.userConnected
          };
      
          this.zoneService.addZone(newZone, this.userConnected.idUser!).subscribe({
            next: (zone) => {
              this.errorMessage = '';
              this.successMessage = `Zone "${zone.nom}" ajoutée avec succès !`; 
              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
              this.createdZone = zone;

              if (assignAfterCreate) {
                this.showAffectation = true;
              } else {
                this.zoneForm.reset();
              }
              
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
        } else {
          this.zoneForm.markAllAsTouched();
        }
  }
    
}
