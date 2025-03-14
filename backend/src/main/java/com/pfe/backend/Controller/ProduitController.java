package com.pfe.backend.Controller;

import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Service.FamilleService;
import com.pfe.backend.Service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/produit")
@RestController
public class ProduitController {
    @Autowired
    private ProduitService produitService;

    @PostMapping("/addProduit")
    public ResponseEntity<Produit> addFiche(@RequestBody Produit produit){
        return produitService.addProduit(produit);
    }

    @GetMapping("/getAllProduit")
    public ResponseEntity<List<Produit>> getProduits(){
        return produitService.getAllProduit();
    }
}
