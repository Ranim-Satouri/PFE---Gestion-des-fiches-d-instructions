import { Menu } from "./Menu";
import { Permission } from "./Permission";
import { User } from "./User";

export interface Groupe {
    idGroupe?: number;
    nom: string;
    modifieLe?: Date;
    actionneur: User;
    menus?: Menu[];        
    permissions?: Permission[]; 
    users?: User[]; 
}
  