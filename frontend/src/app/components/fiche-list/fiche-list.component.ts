import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FicheService } from '../../services/fiche.service';
import { Fiche } from '../../models/Fiche';
import { FormsModule } from '@angular/forms';
import {FicheFormComponent} from '../fiche-form/fiche-form.component';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,FormsModule,FicheFormComponent],
  templateUrl: './fiche-list.component.html',
  styleUrl: './fiche-list.component.css'
})
export class FicheListComponent {

  constructor(private FicheService: FicheService) {}
  fiches : Fiche[] = [];
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
    this.FicheService.getAllFiches().subscribe({
      next : (response :Fiche[]) => {
        this.fiches = response;
      },
      error : (error : any) => {
        console.error('fetching fiches error:', error);
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

  downloadFile(fileName: string) {

    this.FicheService.getPdf(fileName).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Spécifie le nom du fichier à télécharger
      a.click();
      window.URL.revokeObjectURL(url); // Libère l'URL après le téléchargement
    });
  }
  showForm=false;
  showFicheForm(){
    this.showForm=true;
  }
  hideForm(){
    this.showForm=false;
  }
}
