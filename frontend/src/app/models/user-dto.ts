export interface UserDTO {
    idUser: number;
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
    num: string;
    status: UserStatus;
    genre: Genre;
    modifieLe: string; // LocalDateTime est sérialisé en chaîne ISO
    groupeNom: string | null;
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED"
}

export enum Genre {
    FEMME = "FEMME",
    HOMME = "HOMME"
}