package com.pfe.backend.DTO;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FicheHistoryDTO {
    private Long idFiche; // ID de la fiche
    private Integer revisionNumber; // Numéro de révision
    private String revisionType; // Type de révision (ADD, MOD, DEL)
    private LocalDateTime revisionDate; // Date de la modification
    private String status; // Statut de la fiche
    private String commentaire; // Commentaire
    private LocalDateTime expirationDate; // Date d'expiration
    private String pdf; // PDF
    private String ficheAQL; // Fiche AQL
    private String action; // Action (INSERT, UPDATE, DELETE, APPROUVE)
    private LocalDateTime modifieLe; // Date de modification
    private String typeFiche; // Type de fiche (ZONE, LIGNE, OPERATION)
    private String produitNom; // Nom du produit (au lieu de l'objet Produit)
    private String actionneurMatricule; // Matricule de l'actionneur (au lieu de l'objet User)
    private String preparateurMatricule; // Matricule du préparateur
    private String ipdfMatricule; // Matricule de l'IPDF
    private String iqpMatricule; // Matricule de l'IQP
}