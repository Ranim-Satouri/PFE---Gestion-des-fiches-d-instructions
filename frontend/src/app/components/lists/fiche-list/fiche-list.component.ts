import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FicheService } from '../../../services/fiche.service';
import { Fiche, FicheStatus } from '../../../models/Fiche';
import { FormsModule } from '@angular/forms';
import {FicheFormComponent} from '../../add/fiche-form/fiche-form.component';
import { Role, User } from '../../../models/User';
 import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { UpdateFicheComponent } from "../../update/update-fiche/update-fiche.component";
import { FicheValidationComponent } from "../../fiche-validation/fiche-validation.component";
@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, FicheFormComponent, DeleteConfirmComponent, UpdateFicheComponent, FicheValidationComponent],
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
  rejetComment: string = '';
  isCommentModalOpen: boolean = false;

  
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);      
    }
    this.getFiches();
   
  }
  getFiches() {//

    if(this.userConnected.role == Role.SUPERUSER){ 
      this.FicheService.getAllFiches().subscribe({
        next : (response :Fiche[]) => {
          console.log('response', response);
          // Séparation des fiches par statut
          const fichesAValider = response.filter(fiche => 
            fiche.status === FicheStatus.PENDING 
          );
          const fichesRejeter = response.filter(fiche => 
            fiche.status === FicheStatus.REJECTEDIPDF || fiche.status === FicheStatus.REJECTEDIQP
          );
        
          const fichesValider = response.filter(fiche => 
            fiche.status === FicheStatus.ACCEPTEDIPDF
          );
          const autresFiches = response.filter(fiche => 
             fiche.status !== FicheStatus.PENDING && fiche.status !== FicheStatus.REJECTEDIQP && fiche.status !== FicheStatus.REJECTEDIPDF && fiche.status !== FicheStatus.ACCEPTEDIPDF
          );
    
          // Tri par idFiche (décroissant)
          fichesAValider.sort((a, b) => b.idFiche! - a.idFiche!);
          fichesRejeter.sort((a, b) => b.idFiche! - a.idFiche!);
          fichesValider.sort((a, b) => b.idFiche! - a.idFiche!);
          autresFiches.sort((a, b) => b.idFiche! - a.idFiche!);
          
    
          // Combinaison des fiches triées dans l'ordre souhaité
          this.fiches = [...fichesAValider, ...fichesRejeter, ...fichesValider, ...autresFiches];
    
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }else if(this.userConnected.role == Role.IPDF ){
      this.FicheService.getFichesByIPDF(this.userConnected.idUser!).subscribe({
        next: (response: Fiche[]) => {
          console.log('response', response);
          // Séparation des fiches par statut
          const fichesAValider = response.filter(fiche => 
            fiche.status === FicheStatus.PENDING 
          );
          const fichesRejeter = response.filter(fiche => 
            fiche.status === FicheStatus.REJECTEDIPDF 
          );
          const fichesRejeterIQP = response.filter(fiche => 
            fiche.status === FicheStatus.REJECTEDIQP
          );
          const fichesValider = response.filter(fiche => 
            fiche.status === FicheStatus.ACCEPTEDIPDF
          );
          const autresFiches = response.filter(fiche => 
             fiche.status !== FicheStatus.PENDING && fiche.status !== FicheStatus.REJECTEDIQP && fiche.status !== FicheStatus.REJECTEDIPDF && fiche.status !== FicheStatus.ACCEPTEDIPDF
          );
    
          // Tri par idFiche (décroissant)
          fichesAValider.sort((a, b) => b.idFiche! - a.idFiche!);
          fichesRejeter.sort((a, b) => b.idFiche! - a.idFiche!);
          fichesValider.sort((a, b) => b.idFiche! - a.idFiche!);
          autresFiches.sort((a, b) => b.idFiche! - a.idFiche!);
          fichesRejeterIQP.sort((a, b) => b.idFiche! - a.idFiche!);
    
          // Combinaison des fiches triées dans l'ordre souhaité
          this.fiches = [...fichesAValider, ...fichesRejeter, ...fichesValider,...fichesRejeterIQP, ...autresFiches];
    
          console.log(this.fiches);
        },
        error: (error: any) => {
          console.error('Fetching fiches error:', error);
        }
      });
    }
    else if (this.userConnected.role == Role.IQP) {
      this.FicheService.getFichesByIQP(this.userConnected.idUser!).subscribe({
        next: (response: Fiche[]) => {
          const fichesAValider = response.filter(fiche => 
            fiche.status === FicheStatus.PENDING || fiche.status === FicheStatus.ACCEPTEDIPDF
          );
          const autresFiches = response.filter(fiche => 
            fiche.status !== FicheStatus.PENDING && fiche.status !== FicheStatus.ACCEPTEDIPDF
          );
          fichesAValider.sort((a, b) => b.idFiche! - a.idFiche!);
          autresFiches.sort((a, b) => b.idFiche! - a.idFiche!);
          this.fiches = [...fichesAValider, ...autresFiches];
        },
        error: (error: any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }else if(this.userConnected.role == Role.PREPARATEUR ){
      this.FicheService.getFichesByPreparateur(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }else if(this.userConnected.role == Role.OPERATEUR ){
      this.FicheService.getFichesByOperateur(this.userConnected.idUser!).subscribe({
        next : (response :Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
        },
        error : (error : any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }else{
      this.FicheService.getFichesByAdmin(this.userConnected.idUser!).subscribe({
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
  openCommentModal(commentaire: string) {
    this.rejetComment = commentaire;
    this.isCommentModalOpen = true;
  }

}
