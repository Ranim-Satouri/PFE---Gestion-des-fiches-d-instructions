import { User } from "./User";
import { Zone } from "./Zone";

export interface Ligne {
    idLigne ?: number;
    nom: string;  
    modifieLe?: Date;
    actionneur?: User;
    zone? : Zone;
}
  