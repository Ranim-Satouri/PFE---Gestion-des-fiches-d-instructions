import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Famille } from '../../../models/Famille';
import { User } from '../../../models/User';
import { FamilleService } from '../../../services/famille.service';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';

@Component({
  selector: 'app-add-famille-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './add-famille-form.component.html',
  styleUrl: './add-famille-form.component.css'
})
export class AddFamilleFormComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private familleService: FamilleService,private zoneService: ZoneService) {}
  userConnected !: User;
  successMessage: string = '';
  errorMessage = '';
  currentStep : number = 1;
  steps = ["Famille", "Zones"];
  isNewFamille: boolean = true;
  zones: Zone[] = [];
  showSelectorDropdown : Boolean = false;
  affectationFilter: string = ''; // '', 'assigned', 'not-assigned'
  selectedState: string = '';
  selectedZones = new Set<number>();
  zoneSearchText: string = '';
  @Input() famille !: Famille ;
  familyForm !: FormGroup ;
  select: boolean = false;

  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
      if (userFromLocalStorage) {
        this.userConnected = JSON.parse(userFromLocalStorage);
      }
    this.getZones();
    if (this.famille && this.famille.idFamille) {
      this.isNewFamille = false;
      this.familyForm = new FormGroup({
        nom: new FormControl(this.famille.nomFamille, [Validators.required])
      });
      this.selectedZones = new Set(this.famille.zones?.map(zone => zone.idZone!));

    } else {
      // Initialize form for new group
      this.familyForm = new FormGroup({
        nom: new FormControl('', [Validators.required])
      });
    }
  }
  setStep(step: number) {
    if (this.familyForm.valid && this.famille.nomFamille === this.familyForm.value.nom ) {
      this.currentStep = step;
    } else {
      this.familyForm.markAllAsTouched();
    }
  }
  getZones() {
    this.zoneService.getAll().subscribe({
      next : (response :Zone[]) => {
        console.log('fetching zones success:', response);

        this.zones = response.sort((a, b) => b.idZone! - a.idZone!);
      },
      error : (error : any) => {
        console.error('fetching zones error:', error);
      }
    });
  }
  addFamille(buttonType: string) {
    if (this.familyForm.valid) {
      const newFamille: Famille = {
        nomFamille: this.familyForm.value.nom,
        actionneur: this.userConnected
      };
  
      this.familleService.addFamille(newFamille, this.userConnected.idUser!).subscribe({
        next: (famille) => {
          this.famille = famille;
          this.errorMessage = '';
          // this.successMessage = `Famille "${famille.nomFamille}" ajoutée avec succès !`;
  
          // setTimeout(() => {
          //   this.successMessage = '';
          // }, 3000);
  
          this.familyForm.reset();
          this.isNewFamille = false;
         
          if (buttonType === 'create') {
              this.close.emit();
          } else if (buttonType === 'createAndAssign') {
            this.goToNextStep();
          }
        },
        error: (err) => {
          this.successMessage = '';
          console.error('Erreur lors de l’ajout :', err);
  
          if (err.status === 404) {
            this.errorMessage = "Actionneur introuvable";
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
  goToNextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }
  
  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  onClose() {
    this.close.emit();
  }
  selectState(state: string) {
    this.selectedState = state;
    this.affectationFilter = state;
    this.showSelectorDropdown = false;
  }
  get filteredZones(): Zone[] {
    return this.zones.filter(zone => {
      const matchesSearch =
        `${zone.nom}`.toLowerCase().includes(this.zoneSearchText.toLowerCase());

      const isAssigned = this.selectedZones.has(zone.idZone!);

      const matchesAffectation = this.affectationFilter === 'Affectés'
        ? isAssigned
        : this.affectationFilter === 'Non affectés'
          ? !isAssigned
          : true;

      return matchesSearch  && matchesAffectation;
    });
  }
  toggleZoneSelection(zoneId: number) {
    console.log('Selected zone ID:', zoneId);
    if (this.selectedZones.has(zoneId)) {
      this.selectedZones.delete(zoneId);
    } else {
      this.selectedZones.add(zoneId);
    }
    this.select = true;
    console.log('Selected zones 2:', Array.from(this.selectedZones));
  }
  selectAllZones(event: Event ) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.zones.forEach(zone => this.selectedZones.add(zone.idZone!));
    } else {
      this.selectedZones.clear();
    }
    this.select = true;
  }
  
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
  
    const dropdown1 = document.getElementById(`dropdownAffectation`);
    const button1 = target.closest('Affectation-input');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.showSelectorDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
      this.showSelectorDropdown = false; // Ferme le dropdown
    }
  }
  updateFamille(buttonType: string) {
    if (this.familyForm.valid) { 
      if(this.familyForm.value.nom !== this.famille.nomFamille){
        //this.newFamille = { ...this.famille }; // bech yaaml copie mennou ma yekhouhouchhowa bidou , kahter ayy changement ysir fi hedha ysir fi hedhaw mech hakka lezem ysir
        this.famille.nomFamille = this.familyForm.value.nom;
        this.familleService.updateFamille(this.famille,this.famille.idFamille, this.userConnected.idUser!).subscribe({
          next: (famille) => {
            console.log('Famille modifiée avec succès', famille);
            this.errorMessage = '';
            this.successMessage = `Famille modifiée avec succès !`;
            this.famille.nomFamille = this.famille.nomFamille ;
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

  addZonesToFamille(): void {
    console.log('Selected zones:', Array.from(this.selectedZones));
    this.familleService.addZonesToFamille(this.famille.idFamille!, Array.from(this.selectedZones))
      .subscribe(response => {
        console.log('Zoness ajoutées avec succès:', response);
        // this.successMessage = `Famille "${this.famille.nomFamille}" ajoutée avec succès !`;
    
        // setTimeout(() => {
          this.close.emit();
        //   this.successMessage = '';
        // }, 2000);
      }, error => {
        console.error('Erreur lors de l\'ajout des zones:', error);
      });
  }
}
