import { Component, HostListener, Input } from '@angular/core';
import { User } from '../../models/User';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../models/Produit';
import { ProduitService } from '../../services/produit.service';
import { DeleteConfirmComponent } from "../delete-confirm/delete-confirm.component";
@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, DeleteConfirmComponent],
  templateUrl: './produit-list.component.html',
  styleUrl: './produit-list.component.css'
})
export class ProduitListComponent {
constructor(private produitService: ProduitService) {} 
  produits : Produit[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedProduit : number | undefined;
  ngOnInit() { 
    this.getProduits();
  }

  getProduits() { 
    this.produitService.getAll().subscribe({
      next : (response :Produit[]) => {  
        console.log('fetching produits success:', response);
       
        this.produits = response;
      },
      error : (error : any) => {  
        console.error('fetching produits error:', error);
      }
    });
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
  deleteProduit(idProduit: number | undefined): void {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
    this.produitService.deleteProduit(idProduit || undefined ,this.userConnected.idUser || undefined ).subscribe({
      next: () => {
        console.log('Produit supprimée');
        this.dropdownOpen = null;
        this.getProduits()
      },
      error: err => {
        console.error('Erreur suppression Produit', err);
      }
    });
    this.closeDeleteModel()
  }
 openDeleteModel(produit : Produit){
    this.selectedProduit = produit.idProduit;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.selectedProduit = undefined;
    this.isDeleteModelOpen = false;
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
