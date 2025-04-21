import { Ligne } from "./Ligne";
import { Operation } from "./Operation";
import { Produit } from "./Produit";
import { User } from "./User";
import { Zone } from "./Zone";




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

export interface FicheBase {
  idFiche?: number;
  status: FicheStatus;
  commentaire: string;
  expirationDate?: Date;
  pdf: string;
  modifieLe?: Date;
  ficheAQL?: string;
  action: FicheAction;
  preparateur: User;
  ipdf?: User;
  iqp?: User;
  produit: Produit;
  actionneur: User;
  typeFiche: string;
}
export interface FicheZone extends FicheBase {
  zone?: Zone;
  ligne?: Ligne | null;
  operation?: Operation | null;
}

export interface FicheLigne extends FicheBase {
  ligne?: Ligne;
  zone?: Zone | null;
  operation?: Operation | null;
}

export interface FicheOperation extends FicheBase {
  operation?: Operation;
  zone?: Zone | null;
  ligne?: Ligne | null;
}

export type Fiche = FicheZone | FicheLigne | FicheOperation;
