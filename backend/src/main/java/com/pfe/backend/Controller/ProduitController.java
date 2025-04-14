package com.pfe.backend.Controller;

import com.pfe.backend.Model.Produit;
import com.pfe.backend.Service.ServiceProduit.ProduitService;
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

    @PostMapping("/addProduit/{idFamille}")
    public ResponseEntity<?> addProduit(@RequestBody Produit produit,
                                              @PathVariable Long idFamille,
                                              @RequestParam Long idActionneur) {
        try {
            return produitService.addProduit(produit, idFamille, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
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
    public ResponseEntity<?> updateProduit(
                                            @PathVariable Long idProduit,
                                            @RequestBody Produit newProduitData,
                                            @RequestParam Long idActionneur,
                                            @RequestParam Long idFamille) {
        try {
            return produitService.updateProduit(idProduit,idFamille, newProduitData, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idProd}")
    public ResponseEntity<?> DeleteProduit(@PathVariable Long idProd , @RequestParam Long idActionneur) {
        try {
            produitService.DeleteProduit(idProd,idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
