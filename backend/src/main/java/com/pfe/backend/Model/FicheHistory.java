package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FicheHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFiche;
    private String nomFiche;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Fiche.FicheStatus status;
    public enum FicheStatus{
        PENDING, ACCEPTEDIPDF , ACCEPTEDIQP , REFUSED , EXPIRED ,DELETED;
    }
    private String commentaire;
    private String expirationDate;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdf;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] FicheAQL;

    @ManyToOne @JoinColumn(name = "idFiche", nullable = false)
    private Fiche fiche;

    @ManyToOne // Plusieurs fiches peuvent appartenir à une seule zone
    @JoinColumn(name = "idZone", nullable = false) // Clé étrangère
    private Zone zone;

    @ManyToOne // Plusieurs fiches peuvent appartenir à une seule zone
    @JoinColumn(name = "idProduit", nullable = false) // Clé étrangère
    private Produit produit;

    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User preparateur;
    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User IPDF;
    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User IQP;
}
