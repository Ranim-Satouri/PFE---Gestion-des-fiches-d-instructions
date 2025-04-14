package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Audited

public class Famille {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFamille;
    private String nomFamille;
    private boolean isDeleted = false;
    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now(); // Ajoute une valeur par défaut

    // fetch = FetchType.LAZY zedtha besh trajali les donnees mnadhmin f fichier mais mazedthch f produit kolt intesti kn tamali mechekl f front
    @JsonIgnore
    @OneToMany(mappedBy = "famille", fetch = FetchType.LAZY)
    private List<Produit> produits;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;

    @JsonIgnore
    @OneToMany(mappedBy = "famille", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Zone> zones;

}
