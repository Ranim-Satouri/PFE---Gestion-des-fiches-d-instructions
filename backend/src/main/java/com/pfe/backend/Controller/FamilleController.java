package com.pfe.backend.Controller;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Service.FamilleService;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/famille")
@RestController
public class FamilleController {
    @Autowired
    private FamilleService familleService;
    @PostMapping("/addFamille")
    public ResponseEntity<?> addFamille(@RequestBody Famille famille, @RequestParam Long idActionneur) {
        ResponseEntity<?> response = familleService.addFamille(famille, idActionneur);
        if (response.getStatusCode() == HttpStatus.CONFLICT || response.getStatusCode() == HttpStatus.BAD_REQUEST) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }
        return ResponseEntity.ok().body(response.getBody());
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<Famille>> getFamilles(){
        return familleService.getFamilles();
    }
    @PutMapping("/update/{idFam}")
    public ResponseEntity<String> updateFamily(
            @PathVariable Long idFam,
            @RequestBody Famille newFamillyData,
            @RequestParam Long idActionneur) {
        try {
            familleService.updateFamily(idFam, newFamillyData, idActionneur);
            return ResponseEntity.ok("Famille mis à jour avec succès !");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idFam}")
    public ResponseEntity<?> DeleteFamily(@PathVariable Long idFam) {
        try {
            familleService.DeleteFamily(idFam);
            return ResponseEntity.ok("Famille supprimé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/activeFamilies")
    public ResponseEntity<List<Famille>> getActiveFamilies() {
        return ResponseEntity.ok(familleService.getActiveFamilies());
    }
}

