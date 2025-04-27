import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Groupe } from '../../../models/Groupe';
import { User } from '../../../models/User';
import { GroupeService } from '../../../services/groupe.service';
import { AddGroupeComponent } from '../../add/add-groupe/add-groupe.component';
import { DeleteConfirmComponent } from '../../delete-confirm/delete-confirm.component';
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-groupe-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, AddGroupeComponent,DeleteConfirmComponent,FilterPipe],
  templateUrl: './groupe-list.component.html',
  styleUrl: './groupe-list.component.css'
})
export class GroupeListComponent {
 constructor(private groupeService: GroupeService) {}
 searchbar: string ='';
  groupes: Groupe[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User ;
  isDeleteModelOpen : boolean = false;
  selectedGroupe !: number ;
  GroupeToUpdate : Groupe | undefined ;
  showAddModal = false;
  showUpdateModal = false;

  ngOnInit(){
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getGroupes();
  }

  getGroupes() {
    this.groupeService.getAll().subscribe({
      next : (response :Groupe[]) => {
        this.groupes = response.sort((a, b) => b.idGroupe! - a.idGroupe!);
      },
      error: (error: any) => {
        console.error('fetching groupes error:', error);
      },
    });
  }

  deleteGroupe(idGroupe: number): void {
    this.groupeService.deleteGroupe(idGroupe! , this.userConnected.idUser! ).subscribe({
      next: () => {
        console.log('Groupe supprimée');
        this.dropdownOpen = null;
        this.getGroupes()
      },
      error: err => {
        console.error('Erreur suppression Groupe', err);
      }
    });
    this.closeDeleteModel()
  }

  OpenAddGroupePopUp(){
    console.log(this.GroupeToUpdate);
    this.showAddModal = true;
  }
  closeAddGroupePopUp() {
    this.getGroupes();
    this.showAddModal = false;
    this.GroupeToUpdate = undefined ; // aamltha bech kif naawd nhel add marra okhra yabda el groupe undefined
  }
  openDeleteModel(groupe : Groupe) {
    this.selectedGroupe = groupe.idGroupe!;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
  }

  OpenUpdateGroupePopUp(groupe : Groupe){
    console.log('groupe to update:', groupe);
    this.GroupeToUpdate = groupe;
    this.dropdownOpen = null;
    this.showAddModal = true;
  }
  closeUpdateGroupePopUp() {
    this.getGroupes();
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
        //const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        let dropdownHeight = 0;

        if (this.hasPermission('modifier_fiche')) {
          dropdownHeight += 44.5;
        }
        if (this.hasPermission('consulter_historique')) {
          dropdownHeight += 44.5;
        }
        if (this.hasPermission('supprimer_fiche')) {
          dropdownHeight += 44.5;
        }

        const spaceBelow = window.innerHeight - rect.bottom;   // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

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

    this.groupes.sort((a, b) => {
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
