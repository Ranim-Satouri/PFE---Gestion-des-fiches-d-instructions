import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserZoneAssignComponent } from '../../add/user-zone-assign/user-zone-assign.component';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';
import { User } from '../../../models/User';

@Component({
  selector: 'app-update-zone',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './update-zone.component.html',
  styleUrl: './update-zone.component.css'
})
export class UpdateZoneComponent {
  constructor(private zoneService: ZoneService) {}

  @Output() close = new EventEmitter<void>();
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  zoneForm!: FormGroup;
  newZone!: Zone;
  @Input() zone!: Zone;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    console.log('zone:', this.zone);
    this.zoneForm  =  new FormGroup({
      nom: new FormControl( this.zone.nom,[ Validators.required])
    });
  }


  createZone() {
    if (this.zoneForm.valid) {
          if(this.zone.nom != this.zoneForm.value.nom) {
            this.newZone = { ...this.zone };
;
            this.newZone.nom = this.zoneForm.value.nom;
            this.zoneService.updateZone(this.newZone,this.newZone.idZone, this.userConnected.idUser!).subscribe({
              next: (zone) => {
                this.errorMessage = '';
                this.successMessage = `Zone modifiée avec succès !`; 
                this.zone.nom = this.newZone.nom ;
                setTimeout(() => {
                  this.successMessage = '';
                  this.close.emit();
                }, 1000);
            
              },
              error: (err) => {
                this.successMessage = '';
                console.error('Erreur lors de l’ajout :', err);
                if (err.status === 409) {
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
}
