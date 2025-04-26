import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, ViewChild } from '@angular/core';
import * as QRCode from 'qrcode';
import { NgxPaginationModule } from 'ngx-pagination';
import { FicheService } from '../../../services/fiche.service';
import { Fiche, FicheStatus } from '../../../models/Fiche';
import { FormsModule } from '@angular/forms';
import {FicheFormComponent} from '../../add/fiche-form/fiche-form.component';
import { User } from '../../../models/User';
 import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { FicheValidationComponent } from "../../fiche-validation/fiche-validation.component";
import { FilterPipe } from '../../../pipes/filter.pipe';
import { FicheHistoryComponent } from '../../History/fiche-history/fiche-history.component';
@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, FicheFormComponent, DeleteConfirmComponent, FicheValidationComponent, 
    FilterPipe, FicheHistoryComponent],
  templateUrl: './fiche-list.component.html',
  styleUrl: './fiche-list.component.css'
})
export class FicheListComponent {
  @ViewChild('ficheHistoryComponent', { static: false }) ficheHistoryComponent?: FicheHistoryComponent;
  constructor(private FicheService: FicheService ) { }
  searchbar : string = '';
  fiches : Fiche[] = [];  
  dropdownOpen: number | null = null;
  FicheStatus = FicheStatus;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedFiche !: number ;
  ficheToUpdate : Fiche | undefined; ;
  rejetComment: string = '';
  isCommentModalOpen: boolean = false;
  showForm=false;
  isDescending: boolean = true;
  isQrPopupOpen: boolean = false;
  qrCodeUrl: string = '';  
  
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
    this.getFiches();
    this.checkFicheStatusPeriodically();
  }
  getFiches() {
    this.FicheService.getFichesByUserZones(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
  }
  checkFicheStatusPeriodically() {
    setInterval(() => {
      this.FicheService.checkFicheStatusUpdate().subscribe(updated => {
        if (updated) {
          if(updated === true){
            window.location.reload();
          }
        }
      });
    }, 60000); 
  }

  deleteFiche(idFiche: number | undefined ): void {
    
    this.FicheService.deleteFiche(idFiche,this.userConnected.idUser || 1 ).subscribe({
      next: () => {
        console.log('Fiche supprimée');
        this.dropdownOpen = null;
        this.getFiches()
      },
      error: err => {
        console.error('Erreur suppression Fiche', err);
      }
    });
    this.closeDeleteModel()
  }
  openDeleteModel(fiche : Fiche){
    this.selectedFiche = fiche.idFiche!;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;
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

        if (this.hasPermission('modifier_fiche')) {
          dropdownHeight += 44.5; 
        }
        if (this.hasPermission('consulter_historique')) {
          dropdownHeight += 44.5; 
        }
        if (this.hasPermission('supprimer_fiche')) {
          dropdownHeight += 44.5; 
        }
        if (fiche.ficheAQL !== '') {
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
  showFicheForm(){
    this.showForm=true;
  }
  hideForm(){
    this.getFiches();
    this.showForm=false;
    this.ficheToUpdate = undefined ;
  }
  openUpdateForm(fiche : Fiche){
    this.dropdownOpen = null
    this.ficheToUpdate = fiche;
    this.showForm = true;
  }

  openCommentModal(commentaire: string) {
    this.rejetComment = commentaire;
    this.isCommentModalOpen = true;
  }
  sortByDate() {
    this.isDescending = !this.isDescending; // Alterner entre croissant et décroissant

    this.fiches.sort((a, b) => {
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

  generateQrCode(fileName: string) {
      const serverUrl = `http://192.168.1.17:8080/fiche/getPdf/${fileName}`; 
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

  closeQrPopup() {
    this.isQrPopupOpen = false;
  }
  openFicheHistory(idFiche: number | undefined): void {
    if (!idFiche) {
      console.error('ID fiche non défini');
      return;
    }

    if (this.ficheHistoryComponent) {
      this.ficheHistoryComponent.openHistory(idFiche);
    } else {
      console.error('FicheHistoryComponent is not initialized');
    }
  }
}


