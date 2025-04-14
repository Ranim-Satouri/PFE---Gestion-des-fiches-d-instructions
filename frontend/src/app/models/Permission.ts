import { Groupe } from "./Groupe";

export interface Permission {
    idPermission: number;
    nom: string; 
    groupes: Groupe[];
     
  }
  