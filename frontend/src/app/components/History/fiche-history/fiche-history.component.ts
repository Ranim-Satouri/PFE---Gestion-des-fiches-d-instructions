import { Component , HostListener, Input, ApplicationRef,Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { first } from 'rxjs/operators';
import { FicheHistoryDTO } from '../../../models/FicheHistoryDTO';
import { FormsModule } from '@angular/forms';


import { FicheService } from '../../../services/fiche.service';
@Component({
  selector: 'app-fiche-history',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './fiche-history.component.html',
  styleUrl: './fiche-history.component.css'
})
export class FicheHistoryComponent {
  @Input() idFiche: number | null = null;
  visible: boolean = false;
  history: FicheHistoryDTO[] = [];
  errorMessage: string | null = null;
  expandedRevisions: Set<number> = new Set<number>();
  previousEntries: Map<number, FicheHistoryDTO> = new Map<number, FicheHistoryDTO>();

  constructor(
    private ficheService: FicheService,
    private route: ActivatedRoute,
    @Inject(ApplicationRef) private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    if (this.idFiche !== null) {
      this.loadFicheHistory(this.idFiche);
    } else {
      const ficheIdFromRoute = this.route.snapshot.paramMap.get('idFiche');
      if (ficheIdFromRoute) {
        this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() => {
          this.loadFicheHistory(+ficheIdFromRoute);
        });
      }
    }
  }

  public openHistory(ficheId: number): void {
    this.idFiche = ficheId;
    this.loadFicheHistory(ficheId);
    this.visible = true;
  }

  loadFicheHistory(ficheId: number): void {
    this.ficheService.getFicheHistory(ficheId).subscribe({
      next: (data) => {
        this.history = data;
        this.initializePreviousEntries();
        this.errorMessage = null;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l’historique', error);
        this.errorMessage = 'Erreur lors du chargement de l’historique. Veuillez réessayer.';
        this.history = [];
      }
    });
  }

  toggleRevision(revisionNumber: number): void {
    if (this.expandedRevisions.has(revisionNumber)) {
      this.expandedRevisions.delete(revisionNumber);
    } else {
      this.expandedRevisions.add(revisionNumber);
    }
  }

  isExpanded(revisionNumber: number): boolean {
    return this.expandedRevisions.has(revisionNumber);
  }

  initializePreviousEntries(): void {
    this.previousEntries.clear();
    const sortedHistory = [...this.history].sort((a, b) => a.revisionNumber - b.revisionNumber);
    for (let i = 0; i < sortedHistory.length; i++) {
      if (i > 0) {
        this.previousEntries.set(sortedHistory[i].revisionNumber, sortedHistory[i - 1]);
      }
    }
  }

  hasFieldChanged(entry: FicheHistoryDTO, field: keyof FicheHistoryDTO): boolean {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return false;
    }

    const currentValue = entry[field];
    const previousValue = previousEntry[field];

    if (currentValue === undefined || previousValue === undefined) {
      return false;
    }

    return JSON.stringify(currentValue) !== JSON.stringify(previousValue);
  }

  getPreviousValue(entry: FicheHistoryDTO, field: keyof FicheHistoryDTO): any {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return null;
    }
    return previousEntry[field];
  }
  showSelectorDropdown: boolean = false;
  selectedAction: string = '';
  get filteredHistory(): FicheHistoryDTO[] {
    if (!this.selectedAction) {
      return this.history; // Si aucune action n'est sélectionnée, on retourne toute l'historique
    }
    return this.history.filter(entry => entry.action === this.selectedAction);
  }
  selectAction(action: string) {
    this.selectedAction = action;
    this.showSelectorDropdown = false; // Fermer le dropdown après sélection
  }
  getActionText(): string {
    switch (this.selectedAction) {
      case 'APPROUVE':
        return 'Approbation';
      case 'UPDATE':
        return 'Mis à jour';
      case 'INSERT':
        return 'Insertion';
      default:
        return 'Toutes'; // Valeur par défaut si aucune action n'est sélectionnée
    }
  }

   @HostListener('document:click', ['$event'])
        closeDropdown(event: MouseEvent) {
          const target = event.target as HTMLElement;
          const dropdown1 = document.getElementById(`dropdownAffectation`);
          const button1 = target.closest('actionFilter');

          // Vérifiez si le clic est en dehors du dropdown et du bouton
          if (this.showSelectorDropdown  && dropdown1 && !dropdown1.contains(target) && !button1) {
            this.showSelectorDropdown = false; // Ferme le dropdown
          }
      }
}
