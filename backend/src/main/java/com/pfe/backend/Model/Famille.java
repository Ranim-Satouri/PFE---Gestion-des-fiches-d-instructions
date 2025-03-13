package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

@Audited

public class Famille {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFamille;
    private String nomFamille;

    @OneToMany(mappedBy = "famille")
    private List<Produit> produits;
}
