import { User } from "./User";

export interface Famille {
    idFamille?: number;
    nomFamille: string;
    modifieLe?: Date;
    actionneur: User;
}
  