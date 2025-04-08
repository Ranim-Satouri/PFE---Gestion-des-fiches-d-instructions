package com.pfe.backend.Controller;
import com.pfe.backend.Model.Famille;
import com.pfe.backend.Service.FamilleService;
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
        return familleService.addFamille(famille, idActionneur);
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<Famille>> getFamilles(){
        return familleService.getFamilles();
    }
    @PutMapping("/update/{idFam}")
    public ResponseEntity<?> updateFamily(
            @PathVariable Long idFam,
            @RequestBody Famille newFamillyData,
            @RequestParam Long idActionneur) {
        try {
            return familleService.updateFamily(idFam, newFamillyData, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idFam}")
    public ResponseEntity<?> DeleteFamily(@PathVariable Long idFam , @RequestParam Long idActionneur) {
        try {
            familleService.DeleteFamily(idFam , idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/activeFamilies")
    public ResponseEntity<List<Famille>> getActiveFamilies() {
        return ResponseEntity.ok(familleService.getActiveFamilies());
    }
}

