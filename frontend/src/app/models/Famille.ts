import { User } from "./User";
import { Zone } from "./Zone";

export interface Famille {
    idFamille?: number;
    nomFamille: string;
    modifieLe?: Date;
    actionneur: User;
    zones?: Zone[];
}
  