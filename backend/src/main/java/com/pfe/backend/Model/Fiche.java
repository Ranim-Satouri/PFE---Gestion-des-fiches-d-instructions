package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.RelationTargetAuditMode;

import java.util.List;
import org.hibernate.envers.Audited;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Audited
public class Fiche {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFiche;

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

    @ManyToOne(cascade = CascadeType.ALL) // Plusieurs fiches peuvent appartenir à une seule zone
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JoinColumn(name = "idZone", nullable = false) // Clé étrangère
    private Zone zone;


    @ManyToOne(cascade = CascadeType.ALL) // Plusieurs fiches peuvent appartenir à une seule zone
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JoinColumn(name = "idProduit", nullable = false) // Clé étrangère
    private Produit produit;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_preparateur", nullable = false)
    private User preparateur;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_IPDF", nullable = false)
    private User IPDF;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_IQP", nullable = false)
    private User IQP;


}

