package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.List;

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
// fetch = FetchType.LAZY zedtha besh trajali les donnees mnadhmin f fichier mais mazedthch f produit kolt intesti kn tamali mechekl f front
    @OneToMany(mappedBy = "famille", fetch = FetchType.LAZY)
    private List<Produit> produits;
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;
}
