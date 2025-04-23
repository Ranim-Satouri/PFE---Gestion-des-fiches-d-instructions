export interface FamilleHistoryDTO {
    revisionNumber: number;
    modifieLe: string;
    actionneurFullName: string;
    nom: string;
    isDeleted: boolean;
    revisionType?: string; // Ajout
    zones?: string[];
}