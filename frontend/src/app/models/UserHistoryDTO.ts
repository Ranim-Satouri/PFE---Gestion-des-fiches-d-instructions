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
// export interface UserHistoryDTO {
//     revisionNumber: number;
//     revisionDate: Date;
//     changeType: 'CREATED' | 'MODIFIED' | 'DELETED'; // Enum pour les types de changements
//     actionneurMatricule: string;
//     idUser: number;
//     matricule: string;
//     nom: string;
//     prenom: string;
//     email: string;
//     num: string;
//     status: UserStatus;
//     genre: Genre;
//     modifieLe: Date; // LocalDateTime est sérialisé en chaîne ISO
//     groupeNom: string | null;
//     zoneChanges: UserZoneChangeDTO[];
// }

// export interface UserZoneChangeDTO {
//   zoneId: number;
//   zoneName: string;
//   changeType: 'ADD' | 'REMOVE' | 'MODIFY' | 'UNCHANGED'; // Ajout de 'UNCHANGED'
// }
//     export enum UserStatus {
//         ACTIVE = "ACTIVE",
//         INACTIVE = "INACTIVE",
//         DELETED = "DELETED"
//     }

//     export enum Genre {
//         FEMME = "FEMME",
//         HOMME = "HOMME"
//     }