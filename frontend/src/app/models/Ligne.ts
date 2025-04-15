import { User } from "./User";

export interface Ligne {
    idLigne ?: number;
    nom: string;  
    modifieLe?: Date;
    actionneur?: User;
}
  