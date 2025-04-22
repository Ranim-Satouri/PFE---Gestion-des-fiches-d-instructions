import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserHistoryDTO, UserZoneChangeDTO } from '../../../models/UserHistoryDTO';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.css'
})
export class UserHistoryComponent implements OnChanges {
  @Input() idUser: number | null = null;
  @Output() close = new EventEmitter<void>();

  history: UserHistoryDTO[] = [];
  errorMessage: string | null = null;
  expandedRevisions: Set<number> = new Set();

  constructor(private userService: UserService ,private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Vérifier si idUser est fourni via l'URL (mode page)
    const routeId = this.route.snapshot.paramMap.get('idUser');
    if (routeId) {
      this.idUser = Number(routeId);
    }

    // Charger l'historique si idUser est défini
    if (this.idUser) {
      this.errorMessage = null;
      this.loadUserHistory();
    } else {
      this.errorMessage = 'ID utilisateur non valide';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Gérer les changements de idUser via @Input (mode popup)
    if (changes['idUser'] && changes['idUser'].currentValue) {
      console.log('User ID changé:', this.idUser);
      this.errorMessage = null;
      this.loadUserHistory();
    } else if (changes['idUser'] && !changes['idUser'].currentValue) {
      this.errorMessage = 'ID utilisateur non valide';
    }
  }
  loadUserHistory(): void {
    if (!this.idUser) {
      this.errorMessage = 'ID utilisateur non valide';
      return;
    }

    this.userService.getUserHistory(this.idUser).subscribe({
      next: (history) => {
        this.history = history.sort((a, b) => {
          const dateA = new Date(a.revisionDate);
          const dateB = new Date(b.revisionDate);
          const dateComparison = dateB.getTime() - dateA.getTime();
          return dateComparison !== 0 ? dateComparison : b.revisionNumber - a.revisionNumber;
        });
      },
      error: (error) => {
        this.errorMessage = error.message;
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

  hasFieldChanged(entry: UserHistoryDTO, field: keyof UserHistoryDTO): boolean {
    const currentIndex = this.history.indexOf(entry);
    if (currentIndex === this.history.length - 1) {
      return false;
    }
    const nextEntry = this.history[currentIndex + 1];

    if (field === 'zoneChanges') {
      return this.haveZoneChangesChanged(entry.zoneChanges, nextEntry.zoneChanges);
    }

    return entry[field] !== nextEntry[field];
  }

  private haveZoneChangesChanged(currentZones: UserZoneChangeDTO[], nextZones: UserZoneChangeDTO[]): boolean {
    const currentChangedZones = currentZones.filter(zone => zone.changeType !== 'UNCHANGED');
    const nextChangedZones = nextZones.filter(zone => zone.changeType !== 'UNCHANGED');

    if (currentChangedZones.length !== nextChangedZones.length) {
      return true;
    }

    return currentChangedZones.some((zone, index) => {
      const nextZone = nextChangedZones[index];
      if (!nextZone) return true;
      return (
        zone.zoneId !== nextZone.zoneId ||
        zone.zoneName !== nextZone.zoneName ||
        zone.changeType !== nextZone.changeType
      );
    });
  }

  getZoneNames(zoneChanges: UserZoneChangeDTO[]): string {
    if (!zoneChanges || zoneChanges.length === 0) {
      return '-';
    }
    const zoneNames = zoneChanges.map(zone => zone.zoneName).join(', ');
    console.log('Noms des zones:', zoneNames);
    return zoneNames;
  }

  closePopup(): void {
    this.close.emit();
  }
}