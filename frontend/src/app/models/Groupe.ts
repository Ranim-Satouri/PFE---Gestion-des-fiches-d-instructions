import { User } from "./User";

export interface Groupe {
    idGroupe?: number;
    nom: string;
    modifieLe?: Date;
    actionneur: User;
}
  