package com.pfe.backend.Controller;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Service.FamilleService;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/famille")
@RestController
public class FamilleController {
    @Autowired
    private FamilleService familleService;

    @PostMapping("/addFamille")
    public ResponseEntity<Famille> addFamille(@RequestBody Famille famille){
        return familleService.addFamille(famille);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Famille>> getFamilles(){
        return familleService.getFamilles();
    }
}
