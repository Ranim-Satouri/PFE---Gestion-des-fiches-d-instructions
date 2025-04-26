import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Operation } from '../../../models/Operation';
import { User } from '../../../models/User';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { OperationService } from '../../../services/operation.service';
import { AddOperationComponent } from "../../add/add-operation/add-operation.component";
import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";

@Component({
  selector: 'app-operation-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, DeleteConfirmComponent, AddOperationComponent,FilterPipe],
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.css'
})
export class OperationListComponent {

 constructor(private operationService: OperationService) {}
  operations: Operation[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User ;
  isDeleteModelOpen : boolean = false;
  selectedOperation !: number ;
  OperationToUpdate : Operation | undefined ;
  showAddModal = false;
  showUpdateModal = false;
  searchbar: string = '';

  ngOnInit(){
    this.getOperations();
  }

  getUserConnected(){
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
  }
  getOperations() {
    this.operationService.getAll().subscribe({
      next : (response :Operation[]) => {
        this.operations = response.sort((a, b) => b.idOperation! - a.idOperation!);
        console.log('operations:', this.operations);
      },
      error: (error: any) => {
        console.error('fetching operations error:', error);
      },
    });
  }
  deleteOperation(idOperation: number): void {
   this.getUserConnected();
    this.operationService.deleteOperation(idOperation! , this.userConnected.idUser! ).subscribe({
      next: () => {
        console.log('Operation supprimée');
        this.dropdownOpen = null;
        this.getOperations()
      },
      error: err => {
        console.error('Erreur suppression Operation', err);
      }
    });
    this.closeDeleteModel()
  }
  OpenAddOperationPopUp(){
    console.log(this.OperationToUpdate);
    this.showAddModal = true;
  }
  closeAddOperationPopUp() {   
    this.getOperations();
    this.showAddModal = false; 
    this.OperationToUpdate = undefined ; // aamltha bech kif naawd nhel add marra okhra yabda el operation undefined
  }
  openDeleteModel(operation : Operation) {
    this.selectedOperation = operation.idOperation!;
      this.dropdownOpen = null;
      this.isDeleteModelOpen = true;
    }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
  }

  OpenUpdateOperationPopUp(operation : Operation){
    console.log('operation to update:', operation);
    this.OperationToUpdate = operation;
    this.dropdownOpen = null;
    this.showAddModal = true;
  }
  closeUpdateOperationPopUp() {
    this.getOperations();
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

        if (this.hasPermission('modifier_operation')) {
          dropdownHeight += 45.5; 
        }
        if (this.hasPermission('consulter_historique')) {
          dropdownHeight += 45.5; 
        }
        if (this.hasPermission('supprimer_operation')) {
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

    this.operations.sort((a, b) => {
      // Comparaison des dates
      const dateA = new Date(a.modifieLe!);
      const dateB = new Date(b.modifieLe!);

      return this.isDescending
        ? dateB.getTime() - dateA.getTime()  // Tri décroissant
        : dateA.getTime() - dateB.getTime();  // Tri croissant
    });
  }
  hasPermission(permissionName: string): boolean {
    this.getUserConnected();
    const permissions = this.userConnected.groupe?.permissions || []; 
    return permissions.some(permission => permission.nom === permissionName);  
  }
}
