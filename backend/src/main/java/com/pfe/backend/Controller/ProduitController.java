package com.pfe.backend.Controller;

import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Service.FamilleService;
import com.pfe.backend.Service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/produit")
@RestController
public class ProduitController {
    @Autowired
    private ProduitService produitService;

    @PostMapping("/addProduit/{idFamille}/{idActionneur}")
    public ResponseEntity<Produit> addProduit(@RequestBody Produit produit,
                                              @PathVariable Long idFamille,
                                              @PathVariable Long idActionneur) {
        return ResponseEntity.ok(produitService.addProduit(produit, idFamille, idActionneur));

    }
    @GetMapping("/getAllProduits")
    public ResponseEntity<List<Produit>> getProduits(){
        return produitService.getAllProduit();
    }
    @GetMapping("/activeProducts")
    public ResponseEntity<List<Produit>> getActiveProducts() {
        return ResponseEntity.ok(produitService.getActiveProducts());
    }
    @PutMapping("/update/{idProduit}")
    public ResponseEntity<String> updateProduit(
            @PathVariable Long idProduit,
            @RequestBody Produit newProduitData,
            @RequestParam Long idActionneur) {
        try {
            produitService.updateProduit(idProduit, newProduitData, idActionneur);
            return ResponseEntity.ok("Produit mis à jour avec succès !");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idProd}/{idActionneur}")
    public ResponseEntity<?> DeleteProduit(@PathVariable Long idProd , @PathVariable Long idActionneur) {
        try {
            produitService.DeleteProduit(idProd,idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
