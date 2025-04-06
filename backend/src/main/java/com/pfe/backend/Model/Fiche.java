package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.LastModifiedDate;

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
       PENDING, ACCEPTEDIPDF , ACCEPTEDIQP , REJECTEDIQP, REJECTEDIPDF , EXPIRED ,DELETED;
    }

    private String commentaire;

    private String expirationDate;

    //@Lob
    //@Column(columnDefinition = "LONGBLOB")
    private String pdf;

    //@Lob
    //@Column(columnDefinition = "LONGBLOB")
    private String ficheAQL;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private FicheAction action;
    public enum FicheAction{
        INSERT , UPDATE , DELETE , APPROUVE;
    }

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now(); // Ajoute une valeur par défaut


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

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;



}

