import { Fiche } from "./Fiche";

export interface FicheHistoryDto {
    revision: number;
    timestamp: string;
    type: string;
    fiche: Fiche; // Tu peux remplacer `any` par le type exact de `Fiche` si tu as un modèle pour ça
  }