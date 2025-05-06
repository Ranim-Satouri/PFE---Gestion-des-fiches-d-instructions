import { Groupe } from "./Groupe";
import { Menu } from "./Menu";

export interface Permission {
    idPermission: number;
    nom: string; 
    groupes: Groupe[];
    menu : Menu;
  }
  