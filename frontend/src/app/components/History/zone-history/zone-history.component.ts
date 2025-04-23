import { CommonModule } from '@angular/common';
import { ApplicationRef, Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { first } from 'rxjs';
import { ZoneHistory } from '../../../models/ZoneHistoryDTO';
import { ZoneService } from '../../../services/zone.service';
@Component({
  selector: 'app-zone-history',
  standalone: true,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule,CommonModule],
  templateUrl: './zone-history.component.html',
  styleUrl: './zone-history.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ZoneHistoryComponent implements OnInit {
  @Input() idZone: number | null = null;
  visible: boolean = false
  history: ZoneHistory[] = [];
  errorMessage: string | null = null;
  expandedRevisions: Set<number> = new Set<number>();
  previousEntries: Map<number, ZoneHistory> = new Map<number, ZoneHistory>();
  showDialog(): void {this.visible = true; }
  constructor(
    private zoneService: ZoneService,
    private route: ActivatedRoute,
    @Inject(ApplicationRef) private appRef: ApplicationRef,
  ) {}

  ngOnInit(): void {
    // Si un zoneId est passé via @Input, on charge l'historique directement
    if (this.idZone !== null) {
      this.loadZoneHistory(this.idZone);
    } else {
      // Sinon, on utilise l'ID depuis la route (si le composant est utilisé directement via le routing)
      const zoneIdFromRoute = this.route.snapshot.paramMap.get('idZone');
      if (zoneIdFromRoute) {
        this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() => {
          this.loadZoneHistory(+zoneIdFromRoute);
        });
      }
    }
  }
// Méthode publique pour ouvrir le dialog et charger l'historique
public openHistory(zoneId: number): void {
  this.idZone = zoneId;
  this.loadZoneHistory(zoneId);
  this.visible = true;
}
loadZoneHistory(zoneId: number): void {
  this.zoneService.getZoneHistory(zoneId).subscribe({
    next: (data) => {
      this.history = data;
      this.initializePreviousEntries(); // Ajouter cet appel
      this.errorMessage = null; // Réinitialiser le message d'erreur
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

  hasFieldChanged(entry: ZoneHistory, field: keyof ZoneHistory): boolean {
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
  // Nouvelle méthode pour récupérer la valeur précédente
getPreviousValue(entry: ZoneHistory, field: keyof ZoneHistory): any {
  const previousEntry = this.previousEntries.get(entry.revisionNumber);
  if (!previousEntry) {
    return null; // Pas de révision précédente
  }
  return previousEntry[field];
}
}
