import { Produit } from "./Produit";
import { User } from "./User";
import { Zone } from "./Zone";



export interface Fiche {
  idFiche?: number;
  status: FicheStatus;
  commentaire: string;
  expirationDate?: Date;
  pdf: string;
  modifieLe?: Date;
  ficheAQL?: string;
  action: FicheAction;
  zone: Zone;
  produit: Produit;
  preparateur: User;
  ipdf?: User;
  iqp?: User;
  actionneur: User;
}

export enum FicheStatus {
  PENDING = "PENDING",
  ACCEPTEDIPDF = "ACCEPTEDIPDF",
  ACCEPTEDIQP = "ACCEPTEDIQP",
  REJECTEDIPDF = 'REJECTEDIPDF',
  REJECTEDIQP = 'REJECTEDIQP',
  EXPIRED = "EXPIRED",
  DELETED = "DELETED"
}

export enum FicheAction {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROUVE = "APPROUVE"
}
