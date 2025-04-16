import { Component, HostListener, Input } from '@angular/core';
import { User } from '../../../models/User';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { FamilleService } from '../../../services/famille.service';
import { Famille } from '../../../models/Famille';
import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { AddFamilleFormComponent } from "../../add/add-famille-form/add-famille-form.component";
import { UpdateFamilleComponent } from "../../update/update-famille/update-famille.component";
@Component({
  selector: 'app-famille-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, DeleteConfirmComponent, AddFamilleFormComponent,FilterPipe],
  templateUrl: './famille-list.component.html',
  styleUrl: './famille-list.component.css'
})
export class FamilleListComponent {
  constructor(private familleService: FamilleService) {}
  searchbar: String = '';
  familles: Famille[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User ;
  isDeleteModelOpen : boolean = false;
  selectedFamille !: number ;
  FamilleToUpdate : Famille | undefined;
  showAddModal = false;
  showUpdateModal = false;
  step : number = 1;  //men ajl el update 

  ngOnInit(){
    this.getFamilles();
  }

  getFamilles() {
    this.familleService.getAll().subscribe({
      next : (response :Famille[]) => {
        this.familles = response.sort((a, b) => b.idFamille! - a.idFamille!);
      },
      error: (error: any) => {
        console.error('fetching familles error:', error);
      },
    });
  }

  deleteFamille(idFamille: number | undefined): void {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.familleService.deleteFamille(idFamille || undefined , this.userConnected.idUser! ).subscribe({
      next: () => {
        console.log('Famille supprimée');
        this.dropdownOpen = null;
        this.getFamilles()
      },
      error: err => {
        console.error('Erreur suppression Famille', err);
      }
    });
    this.closeDeleteModel()
  }

  OpenAddFamillePopUp(){
    this.showAddModal = true;
  }
  closeAddForm() {
    this.getFamilles();
    this.showAddModal = false;
    this.FamilleToUpdate = undefined ; // aamltha bech kif naawd nhel add marra okhra yabda el groupe undefined

  }
  openDeleteModel(famille : Famille) {
    this.selectedFamille = famille.idFamille!;
      this.dropdownOpen = null;
      this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
  }

  OpenUpdateFamillePopUp(famille : Famille , step : number ){
    this.step = step;
    this.FamilleToUpdate = famille;
    this.dropdownOpen = null;
    this.showAddModal = true;
  }
  closeUpdateForm() {
    this.getFamilles();
    this.showUpdateModal = false;
  }
  // toggleDropdown(index: number, event: MouseEvent): void {
  //   const target = event.target as HTMLElement;
  //   const button = target.closest("button");

  //   if (this.dropdownOpen === index) {
  //     this.dropdownOpen = null;
  //   } else {
  //     const rect = button?.getBoundingClientRect();
  //     if (rect) {
  //       const dropdownHeight = 115; // approx. hauteur du menu dropdown
  //       const spaceBelow = window.innerHeight - rect.bottom;

  //       this.displayAbove = spaceBelow < dropdownHeight;

  //       this.dropdownPosition = {
  //         top: this.displayAbove
  //           ? rect.top + window.scrollY - dropdownHeight - 8
  //           : rect.bottom + window.scrollY + 4,
  //         left: rect.left + window.scrollX - 160 + (button?.offsetWidth || 0),
  //       };
  //     }
  //     this.dropdownOpen = index;
  //   }
  // }
  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        const spaceBelow = window.innerHeight - rect.bottom + 50;   // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

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

    this.familles.sort((a, b) => {
      // Comparaison des dates
      const dateA = new Date(a.modifieLe!);
      const dateB = new Date(b.modifieLe!);

      return this.isDescending
        ? dateB.getTime() - dateA.getTime()  // Tri décroissant
        : dateA.getTime() - dateB.getTime();  // Tri croissant
    });
  }

}
