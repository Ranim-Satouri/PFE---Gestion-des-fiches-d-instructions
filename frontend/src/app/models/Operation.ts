import { Ligne } from "./Ligne";
import { User } from "./User";

export interface Operation {
    idOperation ?: number;
    nom: string;  
    modifieLe?: Date;
    actionneur?: User;
    ligne: Ligne;
}