import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { User } from '../../../models/User';
import { Ligne } from '../../../models/Ligne';
import { LigneService } from '../../../services/ligne.service';
import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { LigneFormComponent } from "../../add/ligne-form/ligne-form.component";
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-ligne-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, DeleteConfirmComponent, LigneFormComponent,FilterPipe],
  templateUrl: './ligne-list.component.html',
  styleUrl: './ligne-list.component.css'
})
export class LigneListComponent {
 constructor(private ligneService: LigneService) {}
 searchbar: string = '';
  lignes: Ligne[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User ;
  isDeleteModelOpen : boolean = false;
  selectedLigne !: number ;
  LigneToUpdate : Ligne | undefined ;
  showAddModal = false;
  showUpdateModal = false;

  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getLignes();
  }
  deleteLigne(idLigne: number): void {
    this.ligneService.deleteLigne(idLigne! , this.userConnected.idUser! ).subscribe({
      next: () => {
        console.log('Ligne supprimée');
        this.dropdownOpen = null;
        this.getLignes()
      },
      error: err => {
        console.error('Erreur suppression Ligne', err);
      }
    });
    this.closeDeleteModel()
  }
  getLignes() {
    if(this.userConnected.groupe?.nom === "SUPERUSER"){
      console.log('superuser');
      this.ligneService.getAll().subscribe({
        next : (response :Ligne[]) => {
          this.lignes = response.sort((a, b) => b.idLigne! - a.idLigne!);
          console.log('lignes:', this.lignes);
        },
        error: (error: any) => {
          console.error('fetching lignes error:', error);
        },
      });
    }else{
      console.log('mech superuser');
      this.ligneService.getLignesByUserZones(this.userConnected.idUser!).subscribe({
        next : (response :Ligne[]) => {
          this.lignes = response.sort((a, b) => b.idLigne! - a.idLigne!);
          console.log('lignes:', this.lignes);
        },
        error: (error: any) => {
          console.error('fetching lignes error:', error);
        },
      });
     };
  }

  OpenAddLignePopUp(){
    console.log(this.LigneToUpdate);
    this.showAddModal = true;
  }
  closeAddLignePopUp() {   
    this.getLignes();
    this.showAddModal = false; 
    this.LigneToUpdate = undefined ; // aamltha bech kif naawd nhel add marra okhra yabda el ligne undefined
  }
  openDeleteModel(ligne : Ligne) {
    this.selectedLigne = ligne.idLigne!;
      this.dropdownOpen = null;
      this.isDeleteModelOpen = true;
    }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
  }

  OpenUpdateLignePopUp(ligne : Ligne){
    console.log('ligne to update:', ligne);
    this.LigneToUpdate = ligne;
    this.dropdownOpen = null;
    this.showAddModal = true;
  }
  closeUpdateLignePopUp() {
    this.getLignes();
    this.showAddModal = false;
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
       // const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
       let dropdownHeight = 0;

       if (this.hasPermission('modifier_ligne')) {
         dropdownHeight += 45.5; 
       }
       if (this.hasPermission('consulter_historique')) {
         dropdownHeight += 45.5; 
       }
       if (this.hasPermission('supprimer_ligne')) {
         dropdownHeight += 45.5; 
       }
        const spaceBelow = window.innerHeight - rect.bottom ;   // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

        this.displayAbove = spaceBelow < dropdownHeight;

        this.dropdownPosition = {
          top: this.displayAbove
            ? rect.top + window.scrollY - dropdownHeight + 25
            : rect.bottom + window.scrollY - 25,
          left: rect.left + window.scrollX - 190 + (button?.offsetWidth || 0),
        };
      }
      this.dropdownOpen = index;
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.dropdownOpen !== null) {
      this.dropdownOpen = null;
    }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropdownDots-${this.dropdownOpen}`);
    const button = target.closest('button[data-dropdown-toggle]');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.dropdownOpen !== null && dropdown && !dropdown.contains(target) && !button) {
      this.dropdownOpen = null; // Ferme le dropdown
    }
  }
  isDescending: boolean = true;
  sortByDate() {
    this.isDescending = !this.isDescending; // Alterner entre croissant et décroissant

    this.lignes.sort((a, b) => {
      // Comparaison des dates
      const dateA = new Date(a.modifieLe!);
      const dateB = new Date(b.modifieLe!);

      return this.isDescending
        ? dateB.getTime() - dateA.getTime()  // Tri décroissant
        : dateA.getTime() - dateB.getTime();  // Tri croissant
    });
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.userConnected.groupe?.permissions || []; 
    return permissions.some(permission => permission.nom === permissionName);  
  }
}
