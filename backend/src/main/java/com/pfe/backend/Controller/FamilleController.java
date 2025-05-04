package com.pfe.backend.Controller;
import com.pfe.backend.Model.Famille;
import com.pfe.backend.DTO.FamilleHistoriqueDTO;
import com.pfe.backend.DTO.FamilleZonesDTO;
import com.pfe.backend.Service.ServiceFamille.FamilleService;
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
    //pour récupérer l’historique des modifications de Famille.
    @GetMapping("/famille-history/{idFamille}")
    public List<FamilleHistoriqueDTO> getFamilleHistory(@PathVariable Long idFamille) {
        return familleService.getFamilleHistory(idFamille);
    }
    //pour récupérer l’audit des modifications de la table famille_zones.
    @GetMapping("/zones-audit/{id}")
    public List<FamilleZonesDTO> getFamilleZonesAudit(@PathVariable Long id) {
        return familleService.getFamilleZonesAudit(id);
    }
    @PostMapping("/addFamille")
    public ResponseEntity<?> addFamille(@RequestBody Famille famille, @RequestParam Long idActionneur) {
        try {
            return familleService.addFamille(famille, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
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
    @PostMapping("/addZonesToFamille")
    public ResponseEntity<?> addZonesToFamille(@RequestParam Long familleId,
                                               @RequestParam List<Long> zoneIds) {
        try {
            Famille result = familleService.addZonesToFamille(familleId, zoneIds);
            return ResponseEntity.ok(result);
        }catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'ajout des zones : " + e.getMessage());
        }
    }

    @GetMapping("/getFamillesByUserZones/{idUser}")
    public ResponseEntity<?> getFamillesByUserZones(@PathVariable long idUser){
        try {
            return ResponseEntity.ok(familleService.getFamillesByUserZones(idUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }

    }
}

