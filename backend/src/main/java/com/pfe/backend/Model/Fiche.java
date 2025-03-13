package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import org.hibernate.envers.Audited;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

@Audited
public class Fiche {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFiche;
    private String nomFiche;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private FicheStatus status;
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

    @ManyToOne // Plusieurs fiches peuvent appartenir à une seule zone
    @JoinColumn(name = "idZone", nullable = false) // Clé étrangère
    private Zone zone;

    @Audited
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

