import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FicheService } from '../../services/fiche.service';
import { Fiche, FicheStatus } from '../../models/Fiche';
import { FormsModule } from '@angular/forms';
import { Role, User } from '../../models/User';
@Component({
  selector: 'app-fiche-validation',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule],
  templateUrl: './fiche-validation.component.html',
  styleUrl: './fiche-validation.component.css',
  encapsulation: ViewEncapsulation.None 
})
export class FicheValidationComponent {
  constructor(private FicheService: FicheService) {}

  @Input() fiche !: Fiche;
  role = Role ;
  FicheStatus = FicheStatus;
  userConnected !: User;
  ficheToReject !: Fiche ;
  rejetComment: string = '';
  isRejetModalOpen: boolean = false;
  previousStatus !: FicheStatus;
  isUploadAQLModalOpen = false;
  aqlFile: File | null = null;
  ficheToApprove!: Fiche;
  isCommentModalOpen: boolean = false;
  @Output() ficheUpdated = new EventEmitter<void>();

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
    console.log(this.fiche);
   
  }
  
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getSelectedOptionText(fiche: Fiche): string {
    switch (fiche.status) {
      case FicheStatus.ACCEPTEDIPDF:
        return 'Verifiée';
      case FicheStatus.ACCEPTEDIQP:
        return 'Approuvée';
      case FicheStatus.REJECTEDIPDF:
      case FicheStatus.REJECTEDIQP:
        return 'Rejetée';
      case FicheStatus.PENDING:
      default:
        return 'En attente';
    }
  }

  onStatusChange(fiche: Fiche ): void {
    //fiche.status = newStatus;
    this.isDropdownOpen = false; 
    console.log('Status changed:', fiche.status);
      this.ficheToApprove = fiche;
      this.ficheToReject = fiche;

      if (fiche.status === FicheStatus.ACCEPTEDIPDF) {
        this.approuverFicheIPDF(fiche, FicheStatus.ACCEPTEDIPDF);
      }
    
      if (fiche.status === FicheStatus.REJECTEDIPDF) {
        this.previousStatus = FicheStatus.PENDING; 
        this.rejetComment = '';
        this.isRejetModalOpen = true;
      }
   
      if (fiche.status === FicheStatus.ACCEPTEDIQP) {
        this.isUploadAQLModalOpen = true;
      }
    
      if (fiche.status === FicheStatus.REJECTEDIQP) {
        this.previousStatus = FicheStatus.PENDING; 
        this.rejetComment = '';
        this.isRejetModalOpen = true;
      }
  }

  getValidationStatus(fiche : Fiche): FicheStatus {  
    console.log('fiche status 1:', fiche.status , fiche.idFiche);
    return fiche.status === FicheStatus.PENDING ? FicheStatus.ACCEPTEDIPDF: FicheStatus.ACCEPTEDIQP;
  }

  getRefuStatus(fiche : Fiche): FicheStatus { 
    console.log('fiche status 2:', fiche.status , fiche.idFiche);
    return fiche.status === FicheStatus.PENDING? FicheStatus.REJECTEDIPDF: FicheStatus.REJECTEDIQP;
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
    //this.getFiches();
    this.ficheUpdated.emit();  

  }
  
  openUploadAQLModal() { 
    this.isUploadAQLModalOpen = true;
  }

  fermerUploadAQLModal() {
    this.isUploadAQLModalOpen = false;
    this.aqlFile = null;
    this.ficheToApprove = undefined!;
    this.ficheUpdated.emit();  
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
        this.ficheUpdated.emit();  
      },
      error: err => {
        console.error('Erreur lors du rejet', err);
      }
    });
  }
  approuverFicheAvecAQL(status: string) {
    if(this.ficheToApprove.status == FicheStatus.REJECTEDIQP && !this.rejetComment.trim() ) return ;    
    if(this.aqlFile){
      this.FicheService.uploadPDF( this.aqlFile).subscribe({
        next: (response) => {
          console.log('Fichier pdf stocker avec succès !', response);
          this.FicheService.validationIQP(this.ficheToApprove.idFiche, this.userConnected.idUser!, status , response.fileName ,'' ).subscribe({
            next: () => {
              this.isRejetModalOpen = false;
              this.isUploadAQLModalOpen = false;
              this.ficheUpdated.emit();  
            },
            error: err => {
              console.error('Erreur lors du rejet', err);
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la fiche !', err);
        }
      });
    }else{
      this.FicheService.validationIQP(this.ficheToApprove.idFiche, this.userConnected.idUser!, status , '', this.rejetComment ).subscribe({
        next: () => {
          this.isRejetModalOpen = false;
          this.isUploadAQLModalOpen = false;
          this.ficheUpdated.emit();  
        },
        error: err => {
          console.error('Erreur lors du rejet', err);
        }
      });
    }
  }
  openCommentModal(commentaire: string) {
    this.rejetComment = commentaire;
    this.isCommentModalOpen = true;
  }
  hasPermission(permissionName: string): boolean {
    const permissions = this.userConnected.groupe?.permissions || []; 
    return permissions.some(permission => permission.nom === permissionName);  
  }

  fix() {
    // Appeler le service pour envoyer le texte à corriger
    this.FicheService.correctText(this.rejetComment).subscribe(
      (response) => {
        // Manipuler la réponse de l'API
        console.log('Texte corrigé:', response);
        this.rejetComment = response.response;
      },
      (error) => {
        // Gérer les erreurs si l'appel échoue
        console.error('Erreur lors de l\'appel API', error);
      }
    );
  }
}
