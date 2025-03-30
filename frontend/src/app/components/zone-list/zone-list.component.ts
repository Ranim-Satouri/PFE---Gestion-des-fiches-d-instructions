import { Component, HostListener, Input } from '@angular/core';
import { Zone } from '../../models/Zone';
import { ZoneService } from '../../services/zone.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/User';
import { DeleteConfirmComponent } from "../delete-confirm/delete-confirm.component";

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, DeleteConfirmComponent],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.css',
})
export class ZoneListComponent {
  constructor(private zoneService: ZoneService) {} 
  zones : Zone[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedZone : number | undefined;
  ngOnInit() { 
    this.getZones();
  }

  getZones() { 
    this.zoneService.getAll().subscribe({
      next : (response :Zone[]) => {  
        console.log('fetching zones success:', response);
       
        this.zones = response;
      },
      error : (error : any) => {  
        console.error('fetching zones error:', error);
      }
    });
  }
  deleteZone(idZone: number | undefined ): void {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
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
    this.selectedZone = zone.idZone;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.selectedZone = undefined;
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
        const dropdownHeight = 115; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
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
}
