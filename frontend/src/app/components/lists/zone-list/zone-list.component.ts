import { Component, HostListener, Input } from '@angular/core';
import { Zone } from '../../../models/Zone';
import { ZoneService } from '../../../services/zone.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/User';
import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { UserZoneAssignComponent } from "../../add/user-zone-assign/user-zone-assign.component";
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Console } from 'console';
import { AddZoneFormComponent } from "../../add/add-zone-form/add-zone-form.component";
import { UpdateZoneComponent } from '../../add/update-zone/update-zone.component';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [NgxPaginationModule,FilterPipe, CommonModule, FormsModule, DeleteConfirmComponent, UserZoneAssignComponent,AddZoneFormComponent, UpdateZoneComponent],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.css',
})
export class ZoneListComponent {
  constructor(private zoneService: ZoneService) {}
  searchbar: string = '';
  zones : Zone[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedZone !: number ;
  showUserPopup = false;
  showAddZoneForm = false;
  showUpdateZoneForm = false;
  zoneToUpdate !: Zone;

  ngOnInit() {
    this.getZones();
  }
  getUserConnected(){
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
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
  deleteZone(idZone: number | undefined ): void {
    this.getUserConnected();
    this.zoneService.deleteZone(idZone || undefined , this.userConnected.idUser || 1  ).subscribe({
      next: () => {
        console.log('Zone supprimée');
        this.dropdownOpen = null;
        this.getZones();
      },
      error: err => {
        console.error('Erreur suppression Zone', err);
      }
    });
    this.closeDeleteModel()
  }
  openDeleteModel(zone: Zone){
    this.selectedZone = zone.idZone!;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
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
        let dropdownHeight = 44.5;

        if (this.hasPermission('modifier_zone')) {
          dropdownHeight += 44.5; 
        }
        if (this.hasPermission('consulter_historique')) {
          dropdownHeight += 44.5; 
        }
        if (this.hasPermission('supprimer_zone')) {
          dropdownHeight += 44.5; 
        }
        // if () {
        //   dropdownHeight += 44.5; 
        // }
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

  openAddForm() {
    this.showAddZoneForm  = true;
  }

  closeAddForm() {
    this.getZones();
    this.showAddZoneForm = false;
  }

  openUserPopup(zone: Zone) {
    this.dropdownOpen = null;
    this.selectedZone = zone.idZone!;
    this.showUserPopup = true;
  }
  closeUserPopup() {
    this.getZones();
    this.showUserPopup = false;
  }

  openUpdateForm(zone : Zone) {
    this.zoneToUpdate = zone;
    this.showUpdateZoneForm  = true;
    this.dropdownOpen = null;
  }

  closeUpdateForm() {
    this.getZones();
    this.showUpdateZoneForm = false;
  }
  isDescending: boolean = true;
  sortByDate() {
    this.isDescending = !this.isDescending; // Alterner entre croissant et décroissant

    this.zones.sort((a, b) => {
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
