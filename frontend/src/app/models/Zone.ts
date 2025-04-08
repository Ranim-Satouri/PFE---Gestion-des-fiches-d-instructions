import { User } from "./User";

export interface Zone {
    idZone?: number;
    nom: string;
    modifieLe?: Date;
    actionneur?: User;
}
  