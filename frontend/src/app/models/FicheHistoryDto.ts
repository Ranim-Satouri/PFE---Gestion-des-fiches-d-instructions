export interface FicheHistoryDTO {
  idFiche: number;
  idZone?: number;
  idLigne?: number;
  idOperation?: number;
  zoneNom?: string;
  ligneNom?: string;
  operationNom?: string;
  revisionNumber: number;
  revisionType: string;
  revisionDate: string;
  status: string;
  commentaire: string;
  expirationDate: string;
  pdf: string;
  ficheAQL: string;
  action: string;
  modifieLe: string;
  typeFiche: string;
  produitNom: string;
  actionneurMatricule: string;
  preparateurMatricule: string;
  ipdfMatricule: string;
  iqpMatricule: string;
  }