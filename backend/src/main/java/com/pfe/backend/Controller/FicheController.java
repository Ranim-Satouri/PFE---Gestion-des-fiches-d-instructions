package com.pfe.backend.Controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.ServiceFiche.FicheService;
import com.pfe.backend.ServiceMail.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RequestMapping("/fiche")
@RestController
public class FicheController {
    @Autowired
    private FicheService ficheService;


    @PostMapping("/addFiche")
    public ResponseEntity<?> addFiche(@RequestPart("fiche") String ficheJson ,@RequestPart("filePDF") MultipartFile filePDF ){
        try {
            System.out.println("aaslema");
        /* ❌ Pourquoi @RequestBody et @RequestPart ne fonctionnent pas ensemble ?
        En Spring Boot, @RequestBody attend une requête en JSON pur (application/json),
        tandis que @RequestPart est utilisé pour gérer des fichiers ou des données mixtes (multipart/form-data).
        💡 Spring ne peut pas traiter les deux types en même temps dans une seule requête.
        ✅ Solution : Utiliser @RequestPart pour tout (JSON + fichier)
        Pour envoyer un fichier + un objet JSON en multipart/form-data, tu dois utiliser @RequestPart pour les deux */

            ObjectMapper objectMapper = new ObjectMapper();
            Fiche fiche = objectMapper.readValue(ficheJson, Fiche.class); //  String --> Fiche

            return ResponseEntity.ok().body(ficheService.addFiche(fiche , filePDF));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    //fel front inshallah kif yenzel el user aala telcharger uen fiche walla cansulter , nekhdhou akal filename w naamlou getPDF
    // w nabaathouh lel front fi wa9tha , haja behya lel performance ya3ni nab9awech nabaathou fel les pdfs el kol lel frontend
    // awka selon el besoin njibou el pdf w zid securisé bien sur
    @GetMapping("/getPdf/{filename}")
    public ResponseEntity<?> getPdf(@PathVariable String filename) {
        try {
            Resource resource = ficheService.loadPdf(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getAllFiches")
    public ResponseEntity<List<Fiche>> getAllFiches(){
        return ResponseEntity.ok().body(ficheService.getFiches());
    }
    @PutMapping("/updateFiche")
    public ResponseEntity<?> updateFiche(@RequestPart("fiche") String ficheJson ,@RequestPart("filePDF") MultipartFile filePDF){
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Fiche fiche = objectMapper.readValue(ficheJson, Fiche.class);
            return ResponseEntity.ok().body(ficheService.updateFiche(fiche , filePDF));
        } catch (Exception e) {
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
            @RequestPart("ficheAQL") MultipartFile ficheAQL) {
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
