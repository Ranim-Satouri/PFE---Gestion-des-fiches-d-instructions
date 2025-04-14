package com.pfe.backend.Service.ServiceProduit;

import com.pfe.backend.Model.Produit;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ProduitService {
    ResponseEntity<?> addProduit(Produit produit, Long idFamille, Long idActionneur);
    ResponseEntity<List<Produit>> getAllProduit();
    ResponseEntity<?> updateProduit(Long idProduit,Long idFamille, Produit newProduitData ,Long idActionneur);
        void DeleteProduit(Long idProduit ,Long idActionneur);
    List<Produit> getActiveProducts();
}
