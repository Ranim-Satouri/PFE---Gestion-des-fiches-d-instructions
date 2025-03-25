import { Famille } from "./Famille";

export interface Produit {
  idProduit?: number;
  nomProduit: string;
  indice: string;
  ref: string;
  famille: Famille;
  modifieLe: Date;

}
