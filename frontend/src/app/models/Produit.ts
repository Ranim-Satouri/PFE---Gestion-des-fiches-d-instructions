import { Famille } from "./Famille";
import { User } from "./User";

export interface Produit {
  idProduit?: number;
  nomProduit: string;
  indice: string;
  ref: string;
  famille: Famille;
  modifieLe?: Date;
  actionneur: User;
}
