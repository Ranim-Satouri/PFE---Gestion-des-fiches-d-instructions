import { Produit } from "./Produit";
import { User } from "./User";
import { Zone } from "./Zone";



export interface Fiche {
  idFiche?: number;
  status: FicheStatus;
  commentaire: string;
  expirationDate: Date;
  pdf: string;
  modifieLe: Date;
  FicheAQL: string;
  action: FicheAction;
  zone: Zone;
  produit: Produit;
  preparateur: User;
  IPDF: User;
  IQP: User;
  actionneur: User;
}

export enum FicheStatus {
  PENDING = "PENDING",
  ACCEPTEDIPDF = "ACCEPTEDIPDF",
  ACCEPTEDIQP = "ACCEPTEDIQP",
  REFUSED = "REFUSED",
  EXPIRED = "EXPIRED",
  DELETED = "DELETED"
}

export enum FicheAction {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROUVE = "APPROUVE"
}
