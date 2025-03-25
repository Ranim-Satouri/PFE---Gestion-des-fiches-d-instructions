package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Audited
@ToString
public class Produit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idProduit;
    private String nomProduit;
    private String indice;
    private String ref;
    private boolean isDeleted = false;
    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now(); // Ajoute une valeur par défaut

    @ManyToOne(cascade = CascadeType.ALL)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JoinColumn(name = "idFamille")
    private Famille famille;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;
   
}
