import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import * as QRCode from 'qrcode';
import { Famille } from '../../../models/Famille';
import { Fiche, FicheStatus } from '../../../models/Fiche';
import { Groupe } from '../../../models/Groupe';
import { Ligne } from '../../../models/Ligne';
import { Operation } from '../../../models/Operation';
import { User } from '../../../models/User';
import { Zone } from '../../../models/Zone';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { FamilleService } from '../../../services/famille.service';
import { FicheService } from '../../../services/fiche.service';
import { LigneService } from '../../../services/ligne.service';
import { OperationService } from '../../../services/operation.service';
import { ZoneService } from '../../../services/zone.service';
import { FicheFormComponent } from '../../add/fiche-form/fiche-form.component';
import { DeleteConfirmComponent } from "../../delete-confirm/delete-confirm.component";
import { FicheValidationComponent } from "../../fiche-validation/fiche-validation.component";
import { FicheHistoryComponent } from '../../History/fiche-history/fiche-history.component';
@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, FicheFormComponent, DeleteConfirmComponent, FicheValidationComponent,
    FilterPipe, FicheHistoryComponent],
  templateUrl: './fiche-list.component.html', styleUrl: './fiche-list.component.css' })
export class FicheListComponent {
  @ViewChild('ficheHistoryComponent', { static: false }) ficheHistoryComponent?: FicheHistoryComponent;
    @ViewChild('groupeInput', { static: false }) groupeInput?: ElementRef;
    @ViewChild('groupeDropdown', { static: false }) groupeDropdown?: ElementRef;
    @ViewChild('grpArrowButton', { static: false }) grpArrowButton?: ElementRef;
    @ViewChild('zoneToggleButton', { static: false }) zoneToggleButton?: ElementRef;
    @ViewChild('zoneDropdown', { static: false }) zoneDropdown?: ElementRef;
    @ViewChild('familleInput', { static: false }) familleInput?: ElementRef;
    @ViewChild('familleDropdown', { static: false }) familleDropdown?: ElementRef;
    @ViewChild('familleArrowButton', { static: false })familleArrowButton?: ElementRef;
    @ViewChild('LigneInput', { static: false }) LigneInput?: ElementRef;
    @ViewChild('situationToggleButton', { static: false }) situationToggleButton?: ElementRef;
@ViewChild('situationDropdown', { static: false }) situationDropdown?: ElementRef;
 constructor(private FicheService: FicheService, private cdr: ChangeDetectorRef,
    private familleService: FamilleService, private zoneService: ZoneService,private LigneService:LigneService,private OperationService :OperationService ) { }
  searchbar : string = '';
  fiches : Fiche[] = [];
  dropdownOpen: number | null = null;
  FicheStatus = FicheStatus;
  page: number = 1;
  itemsPerPage: number = 5;
  displayAbove = false;
  userConnected !: User;
  isDeleteModelOpen : boolean = false;
  selectedFiche !: number ;
  ficheToUpdate : Fiche | undefined;
  rejetComment: string = '';
  isCommentModalOpen: boolean = false;
  showForm=false;
  isDescending: boolean = true;
  isQrPopupOpen: boolean = false;
  qrCodeUrl: string = '';
  // Filter variables
  groupes: Groupe[] = [];
  selectedGroupe: Groupe | null | undefined;
  filteredGroupes: Groupe[] = [];
  isGrpDropdownPositioned = false;
  showGrpDropdown = false;
  selectedStatus: string = '';
  zones: Zone[] = [];
  // Filtrage champs
  refSearchText: string = '';
  indiceSearchText: string = '';
  familleSearchText: string = '';
  selectedFamille?: Famille;
  familles: Famille[] = [];
  filteredFamilles: Famille[] = [];
  searchText: string = '';
  selectedZones: number[] = [];
  filteredFiches: Fiche[] = [];
  lignes: Ligne[] = [];
  operation: Operation[] =[]; 
  OperationSearchText : string = '';
  ligneSearchText: string = '';
  // Dropdown
  isFamilleDropdownPositioned = false;
  dropdownPosition = { top: 0, left: 0 };
  // isFiltrageOpen: boolean = false;
  showFamilleDropdown = false;
// Liste statique des situations
situations: string[] = ['Expirée', 'En attente', 'IPDF', 'IQP' , 'Rejetée IQP' , 'Rejetée IPDF'];

// Situations sélectionnées
selectedSituations: string[] = [];

// Propriété pour gérer l'état de la dropdown des situations
situationDropdownOpen = false;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    this.getFiches();
    this.getZones(); // Charger les zones
    this.getFamilles(); 
    this.checkFicheStatusPeriodically();
    this.getLignes(); 
  }
  getFiches() {
    
    if(this.userConnected.groupe?.nom === "SUPERUSER"){
      console.log('superuser');
      this.FicheService.getAllFiches().subscribe({
        next: (response: Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
          this.filteredFiches = [...this.fiches]; 
          this.applyFilters(); 
        },
        error: (error: any) => {
          console.error('fetching fiches error:', error);
        }
      });
    }else{
      console.log('mech superuser');
      if(this.hasPermission("consulter_fiche_validées") && this.hasPermission("consulter_fiche_non_validées")){
        console.log('consulter_fiche_validées et consulter_fiche_non_validées');
      this.FicheService.getFichesByUserZones(this.userConnected.idUser!).subscribe({
        next: (response: Fiche[]) => {
          this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
          this.filteredFiches = [...this.fiches]; 
          this.applyFilters(); 
        },
        error: (error: any) => {
          console.error('fetching fiches error:', error);
        }
        
      });}
      else if(this.hasPermission("consulter_fiche_validées") && !this.hasPermission("consulter_fiche_non_validées")){
        console.log('consulter_fiche_validées et !consulter_fiche_non_validées');
        this.FicheService.getFichesByOperateur(this.userConnected.idUser!).subscribe({
          next: (response: Fiche[]) => {
            this.fiches = response.sort((a, b) => b.idFiche! - a.idFiche!);
            this.filteredFiches = [...this.fiches]; 
            this.applyFilters(); 
          }
        });
      }}
  }
//----------------------------------------------------------------------------------------------------
   // Fetch the list of Famille
  // ---------------fitrage-------------------------------------------------
  getZones() {
    this.zoneService.getAll().subscribe({
      next: (zones: Zone[]) => {
        this.zones = zones;
        console.log('Zones loaded:', this.zones);}, 
        error: (error: any) => { console.error('Fetching zones error:', error);},}); 
    }
  getLignes() {
    this.LigneService.getAll().subscribe({
      next:(lignes : Ligne[])=>{
        this.lignes=lignes;
        console.log('Lignes loaded:', this.lignes);},
      error: (error: any) => {
        console.error('Fetching Lignes error:', error);
      },
    });
  }
  getOperations() {
    this.OperationService.getAll().subscribe({
      next:(operation:Operation[])=>{
        this.operation=operation;
        console.log('Operations loaded:', this.operation);}
      ,error: (error: any) => {
        console.error('Fetching Operations error:', error);}  
    })}
// Toggler la dropdown des situations
toggleSituationDropdown() {
  this.situationDropdownOpen = !this.situationDropdownOpen;
}
// Mappage des situations visibles aux valeurs en base de données
situationsMap: { [key: string]: string } = {
  'Expirée': 'EXPIRED',
  'En attente': 'PENDING',
  'IPDF': 'ACCEPTEDIPDF',
  'IQP': 'ACCEPTEDIQP',
  'Rejetée IPDF': 'REJECTEDIPDF',
  'Rejetée IQP': 'REJECTEDIQP',

};

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
  this.applyFilters();
}


// Afficher les noms des situations sélectionnées
// getSelectedSituationNames(): string {
//   if (this.selectedSituations.length === 0) {
//     return 'Situation';
//   }
//   return this.selectedSituations.join(', ');
// }
getSelectedSituationNames(): string {
  // On transforme chaque situation sélectionnée en sa version conviviale
  return this.selectedSituations
    .map(situation => {
      const key = Object.keys(this.situationsMap).find(key => this.situationsMap[key] === situation);
      return key || ''; // On retourne le nom de la situation ou une chaîne vide si non trouvé
    })
    .join(', ');
}
  applyFilters() {
    let filtered = [...this.fiches];

    // Filter by Zone
  if (this.selectedZones.length > 0) {
    filtered = filtered.filter((fiche) => {
      let zoneId: number | undefined;

      // Si la zone est directement définie dans la fiche
      if (fiche.zone?.idZone !== undefined) {
        zoneId = fiche.zone.idZone;
      }
      // Si pas de zone directe, chercher via la ligne
      else if (fiche.ligne?.zone?.idZone !== undefined) {
        zoneId = fiche.ligne.zone.idZone;
      }
      // Si pas de ligne ou de zone directe, chercher via l'opération
      else if (fiche.operation?.ligne?.zone?.idZone !== undefined) {
        zoneId = fiche.operation.ligne.zone.idZone;
      }

      const matchesZone = zoneId !== undefined && this.selectedZones.includes(zoneId);
      console.log(`Fiche ID: ${fiche.idFiche}, Zone ID déduite: ${zoneId}, Matches: ${matchesZone}`);
      return matchesZone;
    });
  }// Filter by Situation
    if (this.selectedSituations.length > 0) {
      filtered = filtered.filter((fiche) => {
        const matchesSituation = fiche.status && this.selectedSituations.includes(fiche.status);
        console.log(`Fiche ID: ${fiche.idFiche}, Status: ${fiche.status}, Matches: ${matchesSituation}`);
        return matchesSituation;
      });
    }
      // Filter by Ligne 
      if (this.ligneSearchText) {
        filtered = filtered.filter((fiche) =>
          fiche.ligne?.nom?.toLowerCase().includes(this.ligneSearchText.toLowerCase())
        );
      }
      // Filter by operation
      if (this.OperationSearchText) {
        filtered = filtered.filter((fiche) =>
          fiche.operation?.nom?.toLowerCase().includes(this.OperationSearchText.toLowerCase())
        );
      }
    // Filter by Ref
    if (this.refSearchText) {
      filtered = filtered.filter((fiche) =>
        fiche.produit?.ref?.toLowerCase().includes(this.refSearchText.toLowerCase())
      );
    }

    // Filter by Indice
    if (this.indiceSearchText) {
      filtered = filtered.filter((fiche) =>
        fiche.produit?.indice?.toLowerCase().includes(this.indiceSearchText.toLowerCase())
      );
    }

    // Filter by Famille
    if (this.selectedFamille) {
      filtered = filtered.filter(
        (fiche) => fiche.produit?.famille?.idFamille === this.selectedFamille?.idFamille
      );
    }
    this.filteredFiches = filtered;
    this.cdr.detectChanges();
  }
  clearFilters() {
    this.refSearchText = '';
    this.indiceSearchText = '';
    this.familleSearchText = '';
    this.selectedZones = [];
    this.selectedFamille = undefined;
    this.selectedStatus = ''; // Réinitialiser le statut si utilisé
    this.selectedGroupe = null; // Réinitialiser le groupe si utilisé
    this.filteredFamilles = this.familles;
    this.ligneSearchText = ''; 
    this.selectedSituations = [];
    this.getFiches();
  }

  //--------------tousskiyé dropdown--------------------
  // Famille Dropdown Handlers
  filterFamilles() {
    if (!this.familleSearchText) {
      this.filteredFamilles = this.familles;
      return;}
    this.filteredFamilles = this.familles.filter((f) =>
      f.nomFamille.toLowerCase().includes(this.familleSearchText.toLowerCase())
    );}

  selectFamille(famille: Famille) {
    console.log('✅ Famille sélectionnée :', famille);
    this.familleSearchText = famille.nomFamille;
    this.selectedFamille = famille;
    this.showFamilleDropdown = false;
    this.applyFilters(); }

  onFamilleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.familleSearchText = input.value;
    this.filterFamilles();
    this.showFamilleDropdown = true;
    setTimeout(() => {
      console.log('onFamilleSearchChange: Adjusting dropdown position');
      this.adjustFamilleDropdownPosition();
    }, 0);
  }
  toggleFamilleDropdown() {
    this.showFamilleDropdown = !this.showFamilleDropdown;
    if (this.showFamilleDropdown) {
      this.filterFamilles();
      setTimeout(() => {
        console.log('toggleFamilleDropdown: Adjusting dropdown position');
        this.adjustFamilleDropdownPosition();}, 100);
   }
  }

  adjustFamilleDropdownPosition() {
    if (!this.familleArrowButton || !this.familleDropdown || !this.familleInput) {
      console.log('adjustFamilleDropdownPosition: One or more elements are undefined', {
        familleArrowButton: this.familleArrowButton,
        familleDropdown: this.familleDropdown,
        familleInput: this.familleInput,
      });
      return;
    }
    const arrow = this.familleArrowButton.nativeElement;
    const input = this.familleInput.nativeElement;

    const arrowRect = arrow.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    console.log('Arrow button position:', arrowRect);
    console.log('Input position:', inputRect);

    if (arrowRect.top === 0 && arrowRect.left === 0) {
      console.warn(
        'adjustFamilleDropdownPosition: Arrow button is not visible in the viewport');
      return;
    }
    this.isFamilleDropdownPositioned = true;
    this.cdr.detectChanges();
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

toggleGrpDropdown() {
  this.showGrpDropdown = !this.showGrpDropdown;
  if (this.showGrpDropdown) {
    this.filterGroupes();
    setTimeout(() => {
      console.log('toggleFamilleDropdown: Adjusting dropdown position');
      this.adjustGrpDropdownPosition();}, 100); }
   }

adjustGrpDropdownPosition() {
  if (!this.grpArrowButton || !this.groupeDropdown || !this.groupeInput) {
    console.log('adjustFamilleDropdownPosition: One or more elements are undefined', {
     grpArrowButton: this.grpArrowButton,
     groupeDropdown: this.groupeDropdown,
      groupeInput: this.groupeInput,
    });
    return;
  }
  const arrow = this.grpArrowButton.nativeElement;
  const input = this.groupeInput.nativeElement;
  const arrowRect = arrow.getBoundingClientRect();
  const inputRect = input.getBoundingClientRect();

  console.log('Arrow button position:', arrowRect);
  console.log('Input position:', inputRect);

  if (arrowRect.top === 0 && arrowRect.left === 0) {
    console.warn(
      'adjustFamilleDropdownPosition: Arrow button is not visible in the viewport');
    return;
  }
  this.isGrpDropdownPositioned = true;
  this.cdr.detectChanges();
}
  zoneDropdownOpen = false;
  toggleZoneDropdown() {
    this.zoneDropdownOpen = !this.zoneDropdownOpen;
  }
  onCheckboxChange(event: any) {
    const value = +event.target.value;
    if (event.target.checked) {
      if (!this.selectedZones.includes(value)) {
        this.selectedZones.push(value);
      }
    } else {
      this.selectedZones = this.selectedZones.filter((z) => z !== value);
    }
    this.applyFilters();
  }
  // Groupe filter handlers
  filterGroupes() {
    if (!this.searchText) {
      this.filteredGroupes = this.groupes;
      return;
    }
    this.filteredGroupes = this.groupes.filter((groupe) =>
      groupe.nom?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  selectGroupe(groupe: Groupe) {
    console.log('✅ Groupe sélectionné :', groupe);
    this.searchText = groupe.nom;
    this.selectedGroupe = groupe;
    this.showGrpDropdown = false;
    this.applyFilters();
  }
  onGroupeSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.filterGroupes();
    this.showGrpDropdown = true;
    setTimeout(() => {
      console.log('onGroupeSearchChange: Adjusting dropdown position');
      this.adjustGrpDropdownPosition();
    }, 0); // Reduced delay for faster response
  }
  getSelectedZoneNames(): string {
    if (this.selectedZones.length === 0) {
      return 'Sélectionner des zones';
    }
    const selected = this.zones.filter(
      (z) => z.idZone !== undefined && this.selectedZones.includes(z.idZone)
    ); return selected.map((z) => z.nom).join(', ');
  }

  // Status filter handler
  onStatusChange() {this.applyFilters(); }
  //----------------------------------------------------------------------------------------------------
  checkFicheStatusPeriodically() {
    setInterval(() => {
      this.FicheService.checkFicheStatusUpdate().subscribe(updated => {
        console.log('Reeeefreeeeshhhhhh');
        console.log('Updated status:', updated);
        if (updated) {
          console.log('Fiche status updated');
          if(updated === true){window.location.reload(); }
          // if(updated === true){this.getFiches(); }
        }});}, 60000);
  }

  deleteFiche(idFiche: number | undefined ): void {
    this.FicheService.deleteFiche(idFiche,this.userConnected.idUser || 1 ).subscribe({
      next: () => {
        console.log('Fiche supprimée');
        this.dropdownOpen = null;
        this.getFiches() },
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
     // Logique pour le dropdown des zones
     const clickedInsideZoneToggle = this.zoneToggleButton?.nativeElement.contains(target);
     const clickedInsideZoneDropdown = this.zoneDropdown?.nativeElement.contains(target);
     if (
       this.zoneDropdownOpen && !clickedInsideZoneToggle &&!clickedInsideZoneDropdown)
       {
       this.zoneDropdownOpen = false;
       this.cdr.detectChanges();
       }
    const dropdown2 = document.getElementById('situationDropdown');
    const button2 = document.getElementById('situationToggleButton');
  
    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.situationDropdownOpen && dropdown2 && button2) {
      if (!dropdown2.contains(target) && !button2.contains(target)) {
        this.situationDropdownOpen = false; // Ferme le dropdown
      }
    }
    if (this.showFamilleDropdown && this.familleDropdown && this.familleArrowButton) {
      if (
        !this.familleDropdown.nativeElement.contains(target) && 
        !this.familleArrowButton.nativeElement.contains(target)
      ) {
        this.showFamilleDropdown = false; // Close the dropdown
      }
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
    this.filteredFiches.sort((a, b) => {
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
      const serverUrl = `http://192.168.1.108:8080/fiche/getPdf/${fileName}`;
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
      this.dropdownOpen = null;
    } else {
      console.error('FicheHistoryComponent is not initialized');
    }
  }
}


