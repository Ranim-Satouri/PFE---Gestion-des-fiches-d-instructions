import { User_Zone } from "./User_Zone";
import { Zone } from "./Zone";

export interface User {
    idUser?: number;
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    genre: Genre;
    num: string;
    status: UserStatus;
    role: Role;
    actionneur: User | number |null;
    modifieLe?: Date;
    zones?: Zone[];
  }

  export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED"
  }

  export enum Role {
    SUPERUSER= "SUPERUSER",
    ADMIN = "ADMIN",
    PREPARATEUR = "PREPARATEUR",
    IPDF = "IPDF",
    IQP ="IQP",
    OPERATEUR = "OPERATEUR"
  }
  export enum Genre {
    FEMME = "FEMME",
    HOMME = "HOMME"
  }
