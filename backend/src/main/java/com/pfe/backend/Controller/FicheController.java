package com.pfe.backend.Controller;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/fiche")
@RestController
public class FicheController {
    @Autowired
    private FicheService ficheService;


    @PostMapping("/addFiche")
    public ResponseEntity<?> addFiche(@RequestBody Fiche fiche){
        try {
            return ResponseEntity.ok().body(ficheService.addFiche(fiche));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getAllFiches")
    public ResponseEntity<List<Fiche>> getAllFiches(){
        return ResponseEntity.ok().body(ficheService.getFiches());
    }
    @PutMapping("/updateFiche")
    public ResponseEntity<?> updateFiche(@RequestBody Fiche fiche){
        try {
            return ResponseEntity.ok().body(ficheService.updateFiche(fiche));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/deleteFiche/{idFiche}/{idSupprimateur}")
    public ResponseEntity<?> deleteFiche(@PathVariable("idFiche") long idFiche, @PathVariable("idSupprimateur") long idSupprimateur){
        try {
            return ResponseEntity.ok().body(ficheService.deleteFiche(idFiche , idSupprimateur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }

    }

    @PutMapping("/validationIPDF/{idFiche}/{idIPDF}")
    public ResponseEntity<?> validationIPDF(
            @PathVariable long idFiche,
            @PathVariable long idIPDF,
            @RequestParam String status,
            @RequestParam String commentaire) {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());

        try {
            return ResponseEntity.ok().body(ficheService.ValidationIPDF(idFiche, idIPDF, ficheStatus, commentaire));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/validationIQP/{idFiche}/{idIQP}")
    public ResponseEntity<?> validationIQP(
            @PathVariable long idFiche,
            @PathVariable long idIQP,
            @RequestParam String status,
            @RequestParam("ficheAQL") byte[] ficheAQL) {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());

        try {
            return ResponseEntity.ok().body(ficheService.ValidationIQP(idFiche, idIQP, ficheStatus, ficheAQL));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/getFichesByPreparateur/{idPreparateur}")
    public ResponseEntity<?> getFichesByPreparateur(@PathVariable Long idPreparateur) {
        try{
            return new ResponseEntity<>(ficheService.getFichesByPreparateur(idPreparateur), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getFichesSheetByIPDF/{idIPDF}")
    public ResponseEntity<?> getFichesSheetByIPDF(@PathVariable Long idIPDF) {
        try {
            return new ResponseEntity<>(ficheService.getFichesSheetByIPDF(idIPDF), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getFichesSheetByIQP/{idIQP}")
    public ResponseEntity<?> getFichesSheetByIQP(@PathVariable Long idIQP) {
        try{
            return new ResponseEntity<>(ficheService.getFichesSheetByIQP(idIQP), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
