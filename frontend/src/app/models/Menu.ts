import { Groupe } from "./Groupe";

export interface Menu {
    idMenu: number;
    nom: string;  
    groupes: Groupe[];
}
  