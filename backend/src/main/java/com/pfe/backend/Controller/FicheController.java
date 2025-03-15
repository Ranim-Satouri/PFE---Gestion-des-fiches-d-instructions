package com.pfe.backend.Controller;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Service.FicheService;
import org.springframework.beans.factory.annotation.Autowired;
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
}
