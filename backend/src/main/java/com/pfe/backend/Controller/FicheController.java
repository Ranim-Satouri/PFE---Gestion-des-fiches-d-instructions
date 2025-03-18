package com.pfe.backend.Controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
            ObjectMapper objectMapper = new ObjectMapper();
            Fiche fiche = objectMapper.readValue(ficheJson, Fiche.class);
            return ResponseEntity.ok().body(ficheService.addFiche(fiche , filePDF));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/pdf/{filename}")
    public ResponseEntity<Resource> getPdf(@PathVariable String filename) {
        try {
            System.out.println("test test");
            Path filePath = Paths.get("C:\\Users\\Ranim\\Desktop\\pdf_storage\\").resolve(filename);
            System.out.println(filePath);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                System.out.println("test test 2");
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            @RequestParam("ficheAQL") String ficheAQL) {
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
