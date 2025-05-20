import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FicheValidationComponent} from "../fiche-validation/fiche-validation.component";
import { FicheService } from '../../services/fiche.service'; // Adjust the path as needed
import { Fiche, FicheStatus } from '../../models/Fiche';
import { FicheHistoryComponent } from '../History/fiche-history/fiche-history.component';
import { FicheFormComponent } from '../add/fiche-form/fiche-form.component';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { User } from '../../models/User';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule,
    FormsModule, FicheValidationComponent , FicheFormComponent, DeleteConfirmComponent, FicheHistoryComponent],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.css'
})
export class AdvancedSearchComponent {
  @ViewChild('ficheHistoryComponent', { static: false }) ficheHistoryComponent?: FicheHistoryComponent;
  searchValue = '';
  selectedSpecialization: string | null = null;
  specializationOptions: string[] = [];
  fiches: any[] = [];
  loading = false;
  isExpanded = false;
  message = 'Les résultats s’afficheront ici...';
  showForm=false;
  ficheToUpdate : Fiche | undefined;
  FicheStatus = FicheStatus;
  dropdownOpen: number | null = null;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  page = 1;
  itemsPerPage = 10;
  isDeleteModelOpen : boolean = false;
  selectedFiche !: number ;
  filteredFiches: any[] = []; // ta liste de fiches filtrées
  searchbar: string = '';
  userConnected !: User;
  rejetComment: string = '';
  isCommentModalOpen: boolean = false;
  qrCodeUrl: string = '';
  isQrPopupOpen: boolean = false;
  constructor(private http: HttpClient, private FicheService: FicheService) {}

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.fetchSpecializations();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  resetFilters() {
    this.searchValue = '';
    this.filteredFiches = [];
    this.message = 'Les résultats s’afficheront ici...';
    this.isExpanded = false;
    this.selectedSituations = [];
  }

  submitSearch() {
    if (!this.searchValue && this.selectedSituations.length === 0) {
      this.message = 'Veuillez saisir une requête ou sélectionner au moins une situation.';
      return;
    }
    this.isExpanded = true;
    this.loading = true;

    const idUser = this.userConnected.idUser;

    this.FicheService.searchFichesAvancee(this.searchValue, this.selectedSituations, idUser!).subscribe({
      next: (response) => {
        this.fiches = response;
        this.filteredFiches = response;
        this.message = response.length
          ? ''
          : 'Aucun résultat ne correspond à vos critères de recherche.';
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche avancée :', error);
        this.message = 'Erreur de chargement. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
    // this.FicheService.getAllFiches().subscribe({
    //         next: (response: Fiche[]) => {
    //           console.log('Response:', response);
    //           this.filteredFiches = response;
    //           this.message = response.length ? '' : 'Aucun résultat ne correspond à vos critères de recherche.';
    //           this.loading = false; 
    //         },
    //         error: (error: any) => {
    //           console.error('Error:', error);
    //           console.log('ga3mezna:', error);
    //            this.message = 'Erreur lors du chargement des données. Veuillez réessayer plus tard.';
    //            this.loading = false;
    //         }
    //       });
  }

  sortByColumn(column: string, direction: string) {
    this.fiches.sort((a, b) => {
      return direction === 'asc'
        ? (a[column] > b[column] ? 1 : -1)
        : (a[column] < b[column] ? 1 : -1);
    });
  }

  private fetchSpecializations() {
    this.http.get<string[]>('http://localhost:3000/api/specializations').subscribe({
      next: (data) => this.specializationOptions = data,
      error: () => this.specializationOptions = []
    });
  }

  hasPermission(permission: string): boolean {
    // À adapter à ta logique d’authentification
    const permissions = ['valider_fiche_IQP', 'valider_fiche_IPDF', 'modifier_fiche', 'consulter_historique_fiche', 'supprimer_fiche'];
    return permissions.includes(permission);
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

  generateQrCode(fileName: string) {
        const serverUrl = `http://192.168.1.16:8080/fiche/getPdf/${fileName}`;
        //const serverUrl = `https://9007-197-0-185-128.ngrok-free.app/fiche/getPdf/${fileName}`;
        QRCode.toDataURL(serverUrl, { errorCorrectionLevel: 'H' })
          .then(url => {
            this.qrCodeUrl = url;
            this.isQrPopupOpen = true;
          })
          .catch((err) => {
            console.error('Erreur lors de la génération du QR code: ', err);
          });
    }

  openCommentModal(commentaire: string) {
      this.rejetComment = commentaire;
      this.isCommentModalOpen = true;
    }

  openUpdateForm(fiche : Fiche){
    this.dropdownOpen = null
    this.ficheToUpdate = fiche;
    this.showForm = true;
  }

  openFicheHistory(idFiche: number | undefined): void {
    if (!idFiche) {
      console.error('ID fiche non défini');
      return;
    }

    if (this.ficheHistoryComponent) {
      this.ficheHistoryComponent.openHistory(idFiche);
      this.dropdownOpen = null;
    } else {
      console.error('FicheHistoryComponent is not initialized');
    }
  }

  sortByDate(): void {
    this.filteredFiches.sort((a, b) => new Date(b.modifieLe).getTime() - new Date(a.modifieLe).getTime());
  }
  deleteFiche(idFiche: number | undefined ): void {
    this.FicheService.deleteFiche(idFiche,this.userConnected.idUser || 1 ).subscribe({
      next: () => {
        console.log('Fiche supprimée');
        this.dropdownOpen = null;
        //this.getFiches() 
      },
      error: err => 
        {console.error('Erreur suppression Fiche', err);}
    }); this.closeDeleteModel()
  }
  openDeleteModel(fiche : Fiche){
    this.selectedFiche = fiche.idFiche!;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
  }
  hideForm(){
    //this.getFiches();
    this.showForm=false;
    this.ficheToUpdate = undefined ;
  }
 
  closeQrPopup() {
    this.isQrPopupOpen = false;
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
     const dropdown2 = document.getElementById('situationDropdown');
    const button2 = document.getElementById('situationToggleButton');
  
    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.situationDropdownOpen && dropdown2 && button2) {
      if (!dropdown2.contains(target) && !button2.contains(target)) {
        this.situationDropdownOpen = false; // Ferme le dropdown
      }
    }
  }
  
  toggleDropdown(index: number, event: MouseEvent , fiche: Fiche): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        //const dropdownHeight = 190; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        let dropdownHeight = 0;

        if ((this.hasPermission('modifier_fiche') && fiche.status !== FicheStatus.ACCEPTEDIQP && fiche.status !== FicheStatus.EXPIRED) ||  this.userConnected.groupe?.nom === 'SUPERUSER') {
          dropdownHeight += 44.5;
        }
        if (this.hasPermission('consulter_historique_fiche')) {
          dropdownHeight += 44.5;
        }
        if ((this.hasPermission('supprimer_fiche') && fiche.status !== FicheStatus.ACCEPTEDIQP && fiche.status !== FicheStatus.EXPIRED) ||  this.userConnected.groupe?.nom === 'SUPERUSER') {
          dropdownHeight += 44.5;
        }
        if (fiche.status ===  'ACCEPTEDIQP') {
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

  getSelectedSituationNames(): string {
    const selectedLabels = this.selectedSituations
      .map(code => {
        const label = Object.keys(this.situationsMap).find(
          key => this.situationsMap[key] === code
        );
        return label || '';
      });

    if (selectedLabels.length <= 1) {
      return selectedLabels.join(', ');
    } else {
      return `${selectedLabels[0]}...`;
    }
}


  selectedSituations: string[] = [];
situationsMap: { [key: string]: string } = {
  'Expirée': 'EXPIRED',
  'En attente': 'PENDING',
  'Acceptée par IPDF': 'ACCEPTEDIPDF',
  'Acceptée par IQP': 'ACCEPTEDIQP',
  'Rejetée par  IPDF': 'REJECTEDIPDF',
  'Rejetée par IQP': 'REJECTEDIQP',

};
situationDropdownOpen = false;

toggleSituationDropdown() {
  this.situationDropdownOpen = !this.situationDropdownOpen;
}
situations: string[] = ['Expirée', 'En attente', 'Acceptée par IPDF', 'Acceptée par IQP' , 'Rejetée par  IPDF' , 'Rejetée par IQP'];
// Gérer les changements de checkboxes des situations
onSituationCheckboxChange(event: any) {
  const value = event.target.value;
  const mappedValue = this.situationsMap[value];  // Mappage vers la valeur de la base de données

  if (event.target.checked) {
    if (!this.selectedSituations.includes(mappedValue)) {
      this.selectedSituations.push(mappedValue);
    }
  } else {
    this.selectedSituations = this.selectedSituations.filter((s) => s !== mappedValue);
  }

  console.log('Situations sélectionnées:', this.selectedSituations);
  
}
}
