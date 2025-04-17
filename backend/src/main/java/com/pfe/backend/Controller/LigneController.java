package com.pfe.backend.Controller;


import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Service.ServiceLigne.LigneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/ligne")
@RestController
public class LigneController {
    @Autowired
    private LigneService ligneService;

    @PostMapping("/addLigne")
    public ResponseEntity<?> addLigne(@RequestBody Ligne ligne, @RequestParam Long idActionneur) {
        try {
            return ligneService.addLigne(ligne, idActionneur);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<Ligne>> getLignes(){
        return ResponseEntity.ok(ligneService.getLignes());
    }
    @PutMapping("/update/{idLigne}")
    public ResponseEntity<?> updateLigne(
            @PathVariable Long idLigne,
            @RequestBody Ligne newLigneData,
            @RequestParam Long idActionneur) {
        try {
            return ligneService.updateLigne(idLigne, newLigneData, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idLigne}")
    public ResponseEntity<?> DeleteLigne(@PathVariable Long idLigne , @RequestParam Long idActionneur) {
        try {
            ligneService.DeleteLigne(idLigne , idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/activeLignes")
    public ResponseEntity<List<Ligne>> getActiveLignes() {
        return ResponseEntity.ok(ligneService.getActiveLignes());
    }
}
