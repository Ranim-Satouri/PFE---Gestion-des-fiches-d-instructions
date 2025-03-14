package com.pfe.backend.Service;


import com.pfe.backend.Model.Produit;
import com.pfe.backend.Repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitServiceImp implements ProduitService{
    @Autowired
    private ProduitRepository produitRepository;

    @Override
    public ResponseEntity<Produit> addProduit(Produit produit) {
        return ResponseEntity.ok().body(produitRepository.save(produit));
    }

    @Override
    public ResponseEntity<List<Produit>> getAllProduit() {
        return ResponseEntity.ok().body(produitRepository.findAll());
    }
}
