import { User, UserStatus, Genre } from './User';
import { Zone } from './Zone';

// Interface pour les changements de zones
export interface UserZoneChangeDTO {
  zoneId: number;
  zoneName: string;
  changeType: 'ADD' | 'REMOVE' | 'MODIFY' | 'UNCHANGED';
}

// UserHistoryDTO hérite de User et ajoute les champs spécifiques à l'historique
export interface UserHistoryDTO extends User {
  revisionNumber: number;
  revisionDate: Date;
  modifieLe: Date; 
  changeType: 'CREATED' | 'MODIFIED' | 'DELETED';
  actionneurMatricule: string;
  groupeNom: string | null;
  zoneChanges: UserZoneChangeDTO[];
}
