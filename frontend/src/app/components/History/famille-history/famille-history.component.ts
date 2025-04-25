// famille-history.component.ts
import { Component, Input, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApplicationRef } from '@angular/core';
import { FamilleService } from '../../../services/famille.service';
import { FamilleHistoryDTO } from '../../../models/FamilleHistoryDTO';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
@Component({
    selector: 'app-famille-history',
    standalone: true,
    imports: [TableModule, ButtonModule, DialogModule, InputTextModule,CommonModule],
    templateUrl: './famille-history.component.html',
    styleUrls: ['./famille-history.component.css']
})
export class FamilleHistoryComponent implements OnInit {
    @Input() idFamille: number | null = null;
    visible: boolean = false;
    history: FamilleHistoryDTO[] = [];
    errorMessage: string | null = null;
    expandedRevisions: Set<number> = new Set<number>();
    previousEntries: Map<number, FamilleHistoryDTO> = new Map<number, FamilleHistoryDTO>();

    constructor(
        @Inject(FamilleService) private familleService: FamilleService,
        private route: ActivatedRoute,
        @Inject(ApplicationRef) private appRef: ApplicationRef
    ) {}

    ngOnInit(): void {
        // Récupère l'ID de la famille depuis les paramètres de la route si non fourni via @Input
        if (!this.idFamille) {
            this.idFamille = +this.route.snapshot.paramMap.get('idFamille')!;
        }
    }

    // Méthode publique pour ouvrir le dialog et charger l'historique
    public openHistory(idFamille: number): void {
        this.idFamille = idFamille;
        this.loadHistory();
        this.visible = true;
    }

    private loadHistory(): void {
        if (!this.idFamille) {
            this.errorMessage = 'ID de famille non spécifié.';
            return;
        }

        this.familleService.getFamilleHistory(this.idFamille).subscribe({
            next: (data: FamilleHistoryDTO[]) => {
                this.history = data;this.history = data.sort((a, b) => {
                  const dateA = new Date(a.modifieLe);
                  const dateB = new Date(b.modifieLe);

                  // Comparer les dates (décroissant)
                  if (dateB.getTime() !== dateA.getTime()) {
                      return dateB.getTime() - dateA.getTime(); // Tri par date décroissante
                  }

                  // Si les dates sont égales, trier par revisionNumber (décroissant)
                  return b.revisionNumber - a.revisionNumber;
              });
                this.buildPreviousEntries();
                this.errorMessage = null;
            },
            error: (err: any) => {
                this.errorMessage = 'Erreur lors du chargement de l’historique : ' + err.message;
                console.error('Erreur lors du chargement de l’historique', err);
            }
        });
    }

    // Construit une map des entrées précédentes pour comparaison
    private buildPreviousEntries(): void {
      this.previousEntries.clear();
      // Puisque l'ordre est maintenant décroissant, l'entrée précédente (previousEntry) est à i+1
      for (let i = 0; i < this.history.length; i++) {
          if (i < this.history.length - 1) {
              this.previousEntries.set(this.history[i].revisionNumber, this.history[i + 1]);
          }
      }
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

    // Vérifie si un champ a changé par rapport à la révision précédente
    hasFieldChanged(entry: FamilleHistoryDTO, field: keyof FamilleHistoryDTO): boolean {
        const previousEntry = this.previousEntries.get(entry.revisionNumber);
        if (!previousEntry) {
            return false; // Pas de révision précédente, donc pas de changement
        }

        if (field === 'zones') {
            const currentZones = entry[field] || [];
            const previousZones = previousEntry[field] || [];
            return JSON.stringify(currentZones.sort()) !== JSON.stringify(previousZones.sort());
        }

        return entry[field] !== previousEntry[field];
    }

    // Récupère la valeur précédente d'un champ
    getPreviousValue(entry: FamilleHistoryDTO, field: keyof FamilleHistoryDTO): any {
        const previousEntry = this.previousEntries.get(entry.revisionNumber);
        if (!previousEntry) {
            return null; // Pas de révision précédente
        }
        return previousEntry[field];
    }

    showDialog(): void {
        this.visible = true;
    }
}