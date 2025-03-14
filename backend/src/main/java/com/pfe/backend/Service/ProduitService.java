package com.pfe.backend.Service;

import com.pfe.backend.Model.Produit;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ProduitService {
    ResponseEntity<Produit> addProduit(Produit produit);
    ResponseEntity<List<Produit>> getAllProduit();
}
