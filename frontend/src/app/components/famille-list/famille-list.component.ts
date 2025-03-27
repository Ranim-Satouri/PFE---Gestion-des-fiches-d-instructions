import { Component, HostListener, Input } from '@angular/core';
import { User } from '../../models/User';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { FamilleService } from '../../services/famille.service';
import { Famille } from '../../models/Famille';
@Component({
  selector: 'app-famille-list',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,FormsModule],
  templateUrl: './famille-list.component.html',
  styleUrl: './famille-list.component.css'
})
export class FamilleListComponent {
  constructor(private familleService: FamilleService) {} 
  
  familles : Famille[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 8;

  // Fonction qui gère l'ouverture du menu
  toggleDropdown(index: number): void {
    // Si le menu est déjà ouvert pour cette ligne, on le ferme
    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      // Sinon, on ouvre le menu pour cette ligne
      this.dropdownOpen = index;
    }
  }

  ngOnInit() { 
    this.getFiches();
  }

  getFiches() { 
    this.familleService.getAll().subscribe({
      next : (response :Famille[]) => {         
        this.familles = response;
      },
      error : (error : any) => {  
        console.error('fetching familles error:', error);
      }
    });
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

  shouldDisplayAbove(index: number): boolean {
    const dropdown = document.getElementById(`dropdownDots-${index}`);
    if (dropdown) {
      const rect = dropdown.getBoundingClientRect();
      return rect.bottom > window.innerHeight; // Vérifie si le dropdown dépasse la fenêtre
    }
    return false;
  }
}
