package com.pfe.backend.Service;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.ProduitRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ProduitServiceImp implements ProduitService{
    @Autowired
    private ProduitRepository produitRepository;
    private FamilleRepository familleRepository;

    @Override
    public ResponseEntity<Produit> addProduit(Produit produit) {

        Optional<Famille> famille = familleRepository.findById(produit.getFamille().getIdFamille());
        if(famille.isPresent()){
            produit.setFamille(famille.get());
            if(produit.getNomProduit().isEmpty()){
                produit.setNomProduit(produit.getRef()+"-"+produit.getIndice());
            }
            return ResponseEntity.ok().body(produitRepository.save(produit));
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

    }

    @Override
    public ResponseEntity<List<Produit>> getAllProduit() {
        return ResponseEntity.ok().body(produitRepository.findAll());
    }
}
