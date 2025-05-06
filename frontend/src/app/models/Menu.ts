import { Groupe } from "./Groupe";
import { Permission } from "./Permission";

export interface Menu {
    idMenu: number;
    nom: string;  
    groupes: Groupe[];
    permissions: Permission[];

}
  