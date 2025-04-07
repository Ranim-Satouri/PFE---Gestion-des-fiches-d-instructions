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

    //this.getFiches();
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

       // this.getFiches();
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
        this.ficheUpdated.emit();  

       // this.getFiches();
      },
      error: err => {
        console.error('Erreur lors du rejet', err);
      }
    });
  }
  openCommentModal(commentaire: string) {
    this.rejetComment = commentaire;
    this.isCommentModalOpen = true;
  }
  
}
