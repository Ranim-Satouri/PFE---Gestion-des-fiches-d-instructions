import { CommonModule } from '@angular/common';
import { ApplicationRef, Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { UserHistoryDTO } from '../../../models/UserHistoryDTO';
import { UserService } from '../../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule,CommonModule],
  templateUrl: './user-history.component.html',styleUrl: './user-history.component.css'
})
export class UserHistoryComponent implements OnInit {
  @Input() idUser: number | null = null;
  visible: boolean = false;
  history: UserHistoryDTO[] = [];
  errorMessage: string | null = null;
  expandedRevisions: Set<number> = new Set<number>();
  previousEntries: Map<number, UserHistoryDTO> = new Map<number, UserHistoryDTO>();

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    @Inject(ApplicationRef) private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    // Si un idUser est passé via @Input, on charge l'historique directement
    if (this.idUser !== null) {
      this.loadUserHistory(this.idUser);
    } else {
      // Sinon, on utilise l'ID depuis la route (si le composant est utilisé directement via le routing)
      const userIdFromRoute = this.route.snapshot.paramMap.get('idUser');
      if (userIdFromRoute) {
        this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() => {
          this.loadUserHistory(+userIdFromRoute);
        });
      }
    }
  }

  // Méthode publique pour ouvrir le dialog et charger l'historique
  public openHistory(userId: number): void {
    this.idUser = userId;
    this.loadUserHistory(userId);
    this.visible = true;
  }

  loadUserHistory(userId: number): void {
    this.userService.getUserHistory(userId).subscribe({
      next: (data) => {
        this.history = data.sort((a, b) => {
          const dateA = new Date(a.revisionDate);
          const dateB = new Date(b.revisionDate);
          const dateComparison = dateB.getTime() - dateA.getTime();
          return dateComparison !== 0 ? dateComparison : b.revisionNumber - a.revisionNumber;
        });
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
    // Trier l'historique par numéro de révision (ascendant) pour comparer les entrées
    const sortedHistory = [...this.history].sort((a, b) => a.revisionNumber - b.revisionNumber);
    for (let i = 0; i < sortedHistory.length; i++) {
      if (i > 0) {
        this.previousEntries.set(sortedHistory[i].revisionNumber, sortedHistory[i - 1]);
      }
    }
  }

  hasFieldChanged(entry: UserHistoryDTO, field: keyof UserHistoryDTO): boolean {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return false; // Pas de révision précédente, donc pas de changement
    }

    const currentValue = entry[field];
    const previousValue = previousEntry[field];

    if (currentValue === undefined || previousValue === undefined) {
      return false;
    }

    return JSON.stringify(currentValue) !== JSON.stringify(previousValue);
  }

  hasZonesChanged(entry: UserHistoryDTO): boolean {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return false;
    }
    const currentZones = entry.zones || [];
    const previousZones = previousEntry.zones || [];
    if (currentZones.length !== previousZones.length) {
      return true;
    }
    return !currentZones.every((zone, index) => zone === previousZones[index]);
  }

  getPreviousValue(entry: UserHistoryDTO, field: keyof UserHistoryDTO): any {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return null; // Pas de révision précédente
    }
    return previousEntry[field];
  }

  getPreviousZones(entry: UserHistoryDTO): string | null {
    const previousEntry = this.previousEntries.get(entry.revisionNumber);
    if (!previousEntry) {
      return null;
    }
    return previousEntry.zones?.length ? previousEntry.zones.join(', ') : null;
  }
}