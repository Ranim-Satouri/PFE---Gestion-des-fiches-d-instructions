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
    actionneur: User | null;
    modifieLe: Date;

  }
  
  export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED"
  }
  
  export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
  }
  export enum Genre {
    FEMME = "FEMME",
    HOMME = "HOMME"
  }