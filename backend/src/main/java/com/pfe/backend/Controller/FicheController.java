package com.pfe.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pfe.backend.DTO.FicheHistoryDto;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheLigne;
import com.pfe.backend.Model.FicheOperation;
import com.pfe.backend.Model.FicheZone;
import com.pfe.backend.ServiceFiche.FicheAuditService;
import com.pfe.backend.ServiceFiche.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/fiche")
@RestController
public class FicheController {
    @Autowired
    private FicheService ficheService;


    @PostMapping("/addFicheOperation")
    public ResponseEntity<?> addFiche(@RequestBody FicheOperation fiche) {
        try {
            return ResponseEntity.ok(ficheService.addFicheOperation(fiche));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/addFicheLigne")
    public ResponseEntity<?> addFicheLigne(@RequestBody FicheLigne fiche) {
        try {
            return ResponseEntity.ok(ficheService.addFicheLigne(fiche));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/addFicheZone")
    public ResponseEntity<?> addFicheZone(@RequestBody FicheZone fiche) {
        try {
            return ResponseEntity.ok(ficheService.addFicheZone(fiche));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/uploadPDF")
    public ResponseEntity<Map<String, String>> uploadPDF(@RequestParam("file") MultipartFile file) {
        try{
            String result = ficheService.saveFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("fileName", result);
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de l'enregistrement du fichier");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

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


    @PutMapping("/updateFicheOperation")
    public ResponseEntity<?> updateFicheOperation(@RequestBody FicheOperation fiche ){
        try{
            return ResponseEntity.ok().body(ficheService.updateFicheOperation(fiche));
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/updateFicheZone")
    public ResponseEntity<?> updateFicheZone(@RequestBody FicheZone fiche ){
        try{
            return ResponseEntity.ok().body(ficheService.updateFicheZone(fiche));
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/updateFicheLigne")
    public ResponseEntity<?> updateFicheLigne(@RequestBody FicheLigne fiche ){
        try{
            return ResponseEntity.ok().body(ficheService.updateFicheLigne(fiche));
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/deleteFiche/{idFiche}")
    public ResponseEntity<?> deleteFiche(@PathVariable long idFiche, @RequestParam long idActionneur){
        try {
            return ResponseEntity.ok().body(ficheService.deleteFiche(idFiche , idActionneur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getFichesSheetByUserZones/{idUser}")
    public ResponseEntity<?> getFichesSheetByUserZones(@PathVariable Long idUser) {
        try{
            return new ResponseEntity<>(ficheService.getFichesSheetByUserZones(idUser), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/validationIPDF/{idFiche}")
    public ResponseEntity<?> validationIPDF(
            @PathVariable long idFiche,
            @RequestParam long idIPDF,
            @RequestParam String status,
            @RequestParam String commentaire) {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());

        try {
            return ResponseEntity.ok().body(ficheService.ValidationIPDF(idFiche, idIPDF, ficheStatus, commentaire));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/validationIQP/{idFiche}")
    public ResponseEntity<?> validationIQP(
            @PathVariable long idFiche,
            @RequestParam long idIQP,
            @RequestParam String status,
            @RequestParam String ficheAql,
            @RequestParam String commentaire)  {
        Fiche.FicheStatus ficheStatus = Fiche.FicheStatus.valueOf(status.toUpperCase());

        try {
            return ResponseEntity.ok().body(ficheService.ValidationIQP(idFiche, idIQP, ficheStatus,ficheAql,commentaire));
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
    @GetMapping("/getFichesSheetByOperateur/{idOperateur}")
    public ResponseEntity<?> getFichesSheetByOperateur(@PathVariable Long idOperateur) {
        try{
            return new ResponseEntity<>(ficheService.getFichesSheetByOperateur(idOperateur), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/getFichesSheetByAdmin/{idAdmin}")
    public ResponseEntity<?> getFichesSheetByAdmin(@PathVariable Long idAdmin) {
        try{
            return new ResponseEntity<>(ficheService.getFichesSheetByAdmin(idAdmin), HttpStatus.OK);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/updateStatus")
    public ResponseEntity<Boolean> checkFicheStatusUpdate() {
        boolean updated = ficheService.verifierEtMettreAJourFichesExpirees();
        return ResponseEntity.ok(updated);
    }
}
