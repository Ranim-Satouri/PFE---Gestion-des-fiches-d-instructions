package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Famille {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFamille;
    private String nomFamille;

    @OneToMany(mappedBy = "famille")
    private List<Produit> produits;
}
