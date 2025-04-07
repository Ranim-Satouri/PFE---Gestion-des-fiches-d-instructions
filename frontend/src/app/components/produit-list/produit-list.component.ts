import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Famille } from '../../models/Famille';
import { Produit } from '../../models/Produit';
import { User } from '../../models/User';
import { FilterPipe } from '../../pipes/filter.pipe';
import { FamilleService } from '../../services/famille.service';
import { ProduitService } from '../../services/produit.service';
import { AddProduitFormComponent } from '../add-produit-form/add-produit-form.component';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    DeleteConfirmComponent,
    AddProduitFormComponent,
    FilterPipe,
  ],
  templateUrl: './produit-list.component.html',
  styleUrl: './produit-list.component.css',
})
export class ProduitListComponent {
  @ViewChild('familleInput', { static: false }) familleInput?: ElementRef;
  @ViewChild('familleDropdown', { static: false }) familleDropdown?: ElementRef;
  @ViewChild('familleArrowButton', { static: false })
  familleArrowButton?: ElementRef;
  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private familleService: FamilleService
  ) {}

  searchbar: string = '';
  produits: Produit[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;

  displayAbove = false;
  userConnected!: User;
  isDeleteModelOpen: boolean = false;
  selectedProduit: number | undefined;
  showAddPorduitForm = false;
  // fitrage champs
  // Filtrage champs
  refSearchText: string = '';
  indiceSearchText: string = '';
  familleSearchText: string = '';
  selectedFamille?: Famille;
  familles: Famille[] = [];
  filteredFamilles: Famille[] = [];
  searchText: string = '';
  filteredProducts: Produit[] = [];
  selectedZones: number[] = [];
  selectedStatus: string = '';
  // Dropdown
  isDropdownPositioned = false;
  isFamilleDropdownPositioned = false;
  dropdownPosition = { top: 0, left: 0 };
  isFiltrageOpen: boolean = false;
  showDropdown = false;
  showFamilleDropdown = false;

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getProduits();
    this.getFamilles();
  } // Fetch the list of Famille
  // ---------------fitrage-------------------------------------------------
  applyFilters() {
    let filtered = [...this.produits];
    if (this.refSearchText) {
      filtered = filtered.filter((produit) =>
        produit.ref.toLowerCase().includes(this.refSearchText.toLowerCase())
      );
    }
    // Filter by Indice
    if (this.indiceSearchText) {
      filtered = filtered.filter((produit) =>
        produit.indice
          .toLowerCase()
          .includes(this.indiceSearchText.toLowerCase())
      );
    }
    // Filter by Famille
    if (this.selectedFamille) {
      filtered = filtered.filter(
        (produit) =>
          produit.famille.idFamille === this.selectedFamille?.idFamille
      );
    }
    this.filteredProducts = filtered;
    this.cdr.detectChanges(); // Ensure UI updates
  }
  clearFilters() {
    this.refSearchText = '';
    this.indiceSearchText = '';
    this.familleSearchText = '';
    this.selectedFamille = undefined;
    this.filteredFamilles = this.familles;
    this.applyFilters();
  }
  //--------------tousskiyé dropdown--------------------
  // Famille Dropdown Handlers
  filterFamilles() {
    if (!this.familleSearchText) {
      this.filteredFamilles = this.familles;
      return;
    }

    this.filteredFamilles = this.familles.filter((f) =>
      f.nomFamille.toLowerCase().includes(this.familleSearchText.toLowerCase())
    );
  }

  selectFamille(famille: Famille) {
    console.log('✅ Famille sélectionnée :', famille);
    this.familleSearchText = famille.nomFamille;
    this.selectedFamille = famille;
    this.showFamilleDropdown = false;
    this.applyFilters();
  }

  onFamilleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.familleSearchText = input.value;
    this.filterFamilles();
    this.showFamilleDropdown = true;
    if (this.isFiltrageOpen) {
      setTimeout(() => {
        console.log('onFamilleSearchChange: Adjusting dropdown position');
        this.adjustFamilleDropdownPosition();
      }, 100);
    }
  }

  toggleFamilleDropdown() {
    this.showFamilleDropdown = !this.showFamilleDropdown;
    if (this.showFamilleDropdown && this.isFiltrageOpen) {
      this.filterFamilles();
      setTimeout(() => {
        console.log('toggleFamilleDropdown: Adjusting dropdown position');
        this.adjustFamilleDropdownPosition();
      }, 100);
    }
  }

  adjustFamilleDropdownPosition() {
    if (!this.isFiltrageOpen) {
      console.log(
        'adjustFamilleDropdownPosition: Filtrage section is not open, skipping positioning'
      );
      return;
    }

    if (
      !this.familleArrowButton ||
      !this.familleDropdown ||
      !this.familleInput
    ) {
      console.log(
        'adjustFamilleDropdownPosition: One or more elements are undefined',
        {
          familleArrowButton: this.familleArrowButton,
          familleDropdown: this.familleDropdown,
          familleInput: this.familleInput,
        }
      );
      return;
    }

    const arrow = this.familleArrowButton.nativeElement;
    const dropdown = this.familleDropdown.nativeElement;
    const input = this.familleInput.nativeElement;

    const arrowRect = arrow.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    console.log('Arrow button position:', arrowRect);
    console.log('Input position:', inputRect);

    if (arrowRect.top === 0 && arrowRect.left === 0) {
      console.warn(
        'adjustFamilleDropdownPosition: Arrow button is not visible in the viewport'
      );
      return;
    }

    // Position the dropdown below the SVG, but align its left edge with the input's left edge
    dropdown.style.top = `${arrowRect.bottom + window.scrollY + 4}px`;
    dropdown.style.left = `${inputRect.left + window.scrollX}px`;
    dropdown.style.width = `${inputRect.width}px`;

    console.log('Dropdown positioned at:', {
      top: dropdown.style.top,
      left: dropdown.style.left,
      width: dropdown.style.width,
    });

    // Make the dropdown visible after positioning
    this.isFamilleDropdownPositioned = true;
    this.cdr.detectChanges();
  }

  // Tousskiyé Dropdown
  toggleFiltrage() {
    this.isFiltrageOpen = !this.isFiltrageOpen;
    console.log('isFiltrageOpen:', this.isFiltrageOpen);
    this.cdr.detectChanges();
    if (this.showFamilleDropdown && this.isFiltrageOpen) {
      setTimeout(() => {
        console.log('toggleFiltrage: Adjusting dropdown position');
        this.adjustFamilleDropdownPosition();
      }, 100);
    }
  }
  getFamilles() {
    this.familleService.getAll().subscribe({
      next: (familles: Famille[]) => {
        this.familles = familles;
        this.filteredFamilles = this.familles;
        console.log('Familles loaded:', this.familles);
      },
      error: (error: any) => {
        console.error('Fetching familles error:', error);
      },
    });
  }
  //khedmet nimou
  openAddForm() {
    this.showAddPorduitForm = true;
  }

  closeAddForm() {
    this.showAddPorduitForm = false;
  }
  getProduits() {
    this.produitService.getAll().subscribe({
      next: (response: Produit[]) => {
        console.log('fetching produits success:', response);
        this.produits = response;
        this.filteredProducts = [...this.produits]; // Initialize
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('fetching produits error:', error);
      },
    });
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button');

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        const spaceBelow = window.innerHeight - rect.bottom + 50; // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

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
    this.produitService
      .deleteProduit(
        idProduit || undefined,
        this.userConnected.idUser || undefined
      )
      .subscribe({
        next: () => {
          console.log('Produit supprimée');
          this.dropdownOpen = null;
          this.getProduits();
        },
        error: (err) => {
          console.error('Erreur suppression Produit', err);
        },
      });
    this.closeDeleteModel();
  }
  openDeleteModel(produit: Produit) {
    this.selectedProduit = produit.idProduit;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel() {
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
    const dropdown = document.getElementById(
      `dropdownDots-${this.dropdownOpen}`
    );
    const button = target.closest('button[data-dropdown-toggle]');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (
      this.dropdownOpen !== null &&
      dropdown &&
      !dropdown.contains(target) &&
      !button
    ) {
      this.dropdownOpen = null; // Ferme le dropdown
    }
  }
}
