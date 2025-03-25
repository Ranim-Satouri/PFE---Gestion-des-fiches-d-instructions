import { Fiche } from "./Fiche";

export interface FicheHistoryDto {
    revision: number;
    timestamp: string;
    type: string;
    fiche: Fiche; 
    modifieLe: Date;
  }