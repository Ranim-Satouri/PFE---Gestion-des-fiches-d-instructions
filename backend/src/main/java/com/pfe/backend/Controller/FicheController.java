package com.pfe.backend.Controller;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/fiche")
@RestController
public class FicheController {
    @Autowired
    private FicheService ficheService;

    @PostMapping("/addFiche")
    public ResponseEntity<Fiche> addFiche(@RequestBody Fiche fiche){
        return ficheService.addFiche(fiche);
    }

    @GetMapping("/getAllFiches")
    public ResponseEntity<List<Fiche>> getAllFiches(){
        return ficheService.getFiches();
    }
    @PutMapping("/updateFiche/{idModificateur}")
    public ResponseEntity<Fiche> updateFiche(@RequestBody Fiche fiche , @PathVariable int idModificateur){
        return ficheService.updateFiche(fiche , idModificateur);
    }
    @PutMapping("/deleteFiche/{idFiche}/{idSupprimateur}")
    public ResponseEntity<Fiche> deleteFiche(@PathVariable("idFiche") long idFiche, @PathVariable("idSupprimateur") long idSupprimateur){
        System.out.println("ID Fiche: " + idFiche + ", ID Supprimateur: " + idSupprimateur);
        return ficheService.deleteFiche(idFiche , idSupprimateur);
    }

    @PutMapping("/validationIPDF/{idFiche}/{idIPDF}")
    public ResponseEntity<Fiche> validationIPDF(
            @PathVariable long idFiche,
            @PathVariable long idIPDF,
            @RequestParam String status,
            @RequestParam String commentaire) {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());
        return ficheService.ValidationIPDF(idFiche, idIPDF, ficheStatus, commentaire);

    }

    @PutMapping("/validationIQP/{idFiche}/{idIQP}")
    public ResponseEntity<Fiche> validationIQP(
            @PathVariable long idFiche,
            @PathVariable long idIQP,
            @RequestParam String status,
            @RequestParam("ficheAQL") byte[] ficheAQL) {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());
        return ficheService.ValidationIQP(idFiche, idIQP, ficheStatus, ficheAQL);

    }
}
