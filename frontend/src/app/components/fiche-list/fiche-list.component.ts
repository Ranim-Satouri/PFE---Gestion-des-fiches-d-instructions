import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FicheService } from '../../services/fiche.service';
import { Fiche, FicheStatus } from '../../models/Fiche';
import { FormsModule } from '@angular/forms';
import {FicheFormComponent} from '../add/fiche-form/fiche-form.component';
import { Role, User } from '../../models/User';
 import { DeleteConfirmComponent } from "../delete-confirm/delete-confirm.component";
import { UpdateFicheComponent } from "../update/update-fiche/update-fiche.component";
@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, FicheFormComponent, DeleteConfirmComponent, UpdateFicheComponent],
  templateUrl: './fiche-list.component.html',
  styleUrl: './fiche-list.component.css'
})
export class FicheListComponent {

  constructor(private FicheService: FicheService) {}
  fiches : Fiche[] = [];
  dropdownOpen: number | null = null;
  role = Role ;
  FicheStatus = FicheStatus;
  page: number = 1;
  itemsPerPage: number = 5;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedFiche !: number ;
  showUpdateForm : boolean = false;
  ficheToUpdate !: Fiche ;

  ficheToReject !: Fiche ;
  rejetComment: string = '';
  isRejetModalOpen: boolean = false;
  previousStatus !: FicheStatus;
  isUploadAQLModalOpen = false;
  aqlFile: File | null = null;
  ficheToApprove!: Fiche;
  
  
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
    this.getFiches();
   
  }
  getFiches() {

    if(this.userConnected.role == Role.SUPERUSER){ 
      this.FicheService.getAllFiches().subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }
    if(this.userConnected.role == Role.IPDF ){
      this.FicheService.getFichesByIPDF(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }
    if(this.userConnected.role == Role.IQP ){
      this.FicheService.getFichesByIQP(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }
    if(this.userConnected.role == Role.PREPARATEUR ){
      this.FicheService.getFichesByPreparateur(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }
    
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
  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");
  
    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 190; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
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
    this.getFiches();
    this.showForm=false;
  }
  openUpdateForm(fiche : Fiche){
    this.dropdownOpen = null
    this.ficheToUpdate = fiche;
    this.showUpdateForm = true;
  }
  closeUpdateForm(){
    this.showUpdateForm = false;
    this.getFiches(); 
  }


  
  onStatusChange(fiche: Fiche): void {
    if (this.userConnected.role === 'IPDF') {
      if (fiche.status === FicheStatus.ACCEPTEDIPDF) {
        this.approuverFicheIPDF(fiche, FicheStatus.ACCEPTEDIPDF);
      }
    
      if (fiche.status === FicheStatus.REJECTEDIPDF) {
        this.previousStatus = FicheStatus.PENDING; 
        this.ficheToReject = fiche;
        this.rejetComment = '';
        this.isRejetModalOpen = true;
      }
    } else {
      this.ficheToApprove = fiche;
      if (fiche.status === FicheStatus.ACCEPTEDIQP) {
        this.isUploadAQLModalOpen = true;
      }
    
      if (fiche.status === FicheStatus.REJECTEDIQP) {
        this.previousStatus = FicheStatus.PENDING; 
        this.ficheToReject = fiche;
        this.rejetComment = '';
        this.isRejetModalOpen = true;
      }
    }
  }

  getValidationStatus(): FicheStatus {  //nee bech nchoufou kif yaaml apporuver chnaw status ywali selon role mta3 el sayed li approuva
    return this.userConnected.role === 'IPDF'
      ? FicheStatus.ACCEPTEDIPDF
      : FicheStatus.ACCEPTEDIQP;
  }
  // getDefaultStatus(fiche : Fiche ): FicheStatus { // hedhy bech yhot en attente ken mazelt mech validéé lel ipdf w en attente zeda lel iqp wa9t tebda valide bel ipdf
  //     if(this.userConnected.role === 'IPDF' && fiche.status === FicheStatus.ACCEPTEDIPDF) {
  //       return FicheStatus.PENDING;
  //     }else {
  //       return FicheStatus.ACCEPTEDIPDF;
  //     }
  // }
  getRefuStatus(): FicheStatus { 
    return this.userConnected.role === 'IPDF'
      ? FicheStatus.REJECTEDIPDF
      : FicheStatus.REJECTEDIQP;
  }
    
 
  openRejetModal(fiche: any) {
    this.ficheToReject = fiche;
    this.rejetComment = '';
    this.isRejetModalOpen = true;
  }
  fermerRejetModal() {
    this.isRejetModalOpen = false;
    this.rejetComment = '';
    this.ficheToReject = undefined!;
    this.getFiches();
  }
  
  openUploadAQLModal() { 
    this.isUploadAQLModalOpen = true;
  }

  fermerUploadAQLModal() {
    this.isUploadAQLModalOpen = false;
    this.aqlFile = null;
    this.ficheToApprove = undefined!;
    this.getFiches();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.aqlFile = input.files[0];
    }
  }

  approuverFicheIPDF(fiche: Fiche , status: string) {

    if(status == FicheStatus.REJECTEDIPDF && !this.rejetComment.trim() ) return ;
    this.FicheService.validationIPDF(fiche.idFiche, this.userConnected.idUser!, status , this.rejetComment).subscribe({
      next: () => {
        this.isRejetModalOpen = false;
        this.getFiches();
      },
      error: err => {
        console.error('Erreur lors du rejet', err);
      }
    });
  }
  approuverFicheAvecAQL(status: FicheStatus) {
    if(this.ficheToApprove.status == FicheStatus.REJECTEDIQP && !this.rejetComment.trim() ) return ;
    this.FicheService.validationIQP(this.ficheToApprove.idFiche, this.userConnected.idUser!, status ,this.aqlFile! ).subscribe({
      next: () => {
        this.isRejetModalOpen = false;
        this.isUploadAQLModalOpen = false;
        this.getFiches();
      },
      error: err => {
        console.error('Erreur lors du rejet', err);
      }
    });
  }
  // openCommentPopup(commentaire: string) {
  //   // Tu peux utiliser une modale custom, un MatDialog, un SweetAlert, ou juste un alert() simple
  //   if (commentaire) {
  //     alert("Commentaire de rejet :\n" + commentaire);
  //   } else {
  //     alert("Aucun commentaire disponible.");
  //   }
  // }
  isCommentModalOpen: boolean = false;
  openCommentModal(commentaire: string) {
    this.rejetComment = commentaire;
    this.isCommentModalOpen = true;
  }
  
  closeCommentModal() {
    this.isCommentModalOpen = false;
    this.rejetComment = '';
  }
  
}
