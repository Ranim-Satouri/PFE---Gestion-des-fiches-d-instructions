import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Operation } from '../../../models/Operation';
import { User } from '../../../models/User';
import { OperationService } from '../../../services/operation.service';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';

@Component({
  selector: 'app-add-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './add-operation.component.html',
  styleUrl: './add-operation.component.css'
})
export class AddOperationComponent {
 @Output() close = new EventEmitter<void>();
  constructor(private operationService: OperationService,private zoneService: ZoneService) {}
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  isNewOperation: boolean = true;
  @Input() operation !: Operation ;
  operationForm !: FormGroup ;
  select: boolean = false;

  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
   
    if (this.operation && this.operation.idOperation) {
      this.isNewOperation = false;
      this.operationForm = new FormGroup({
        nom: new FormControl(this.operation.nom, [Validators.required])
      });

    } else {
      // Initialize form for new group
      this.operationForm = new FormGroup({
        nom: new FormControl('', [Validators.required])
      });
    }
  }


  addOperation() {
    if (this.operationForm.valid) {
      const newOperation: Operation = {
        nom: this.operationForm.value.nom,
        actionneur: this.userConnected
      };
  
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
            this.errorMessage = "Une operation avec ce nom existe déjà.";
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
      if(this.operationForm.value.nom !== this.operation.nom){
        //this.newOperation = { ...this.operation }; // bech yaaml copie mennou ma yekhouhouchhowa bidou , kahter ayy changement ysir fi hedha ysir fi hedhaw mech hakka lezem ysir
        this.operation.nom = this.operationForm.value.nom;
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
              this.errorMessage = "Une operation avec ce nom existe déjà.";
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

  
}
