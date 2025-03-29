package com.pfe.backend.Service;

import com.pfe.backend.Model.Produit;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ProduitService {
    Produit addProduit(Produit produit, Long idFamille, Long idActionneur);
    ResponseEntity<List<Produit>> getAllProduit();
       void updateProduit(Long idProduit, Produit newProduitData ,Long idActionneur);
        void DeleteProduit(Long idProduit ,Long idActionneur);
    List<Produit> getActiveProducts();
}
