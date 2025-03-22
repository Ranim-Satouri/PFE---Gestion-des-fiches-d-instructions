package com.pfe.backend.Repository;

import com.pfe.backend.Model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit,Long> {
    List<Produit> findByIsDeletedFalse();
    Optional<Produit> findByNomProduit(String nomProduit);

}
