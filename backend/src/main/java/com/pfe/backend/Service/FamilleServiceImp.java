package com.pfe.backend.Service;

import com.pfe.backend.Model.Famille;
import com.pfe.backend.Repository.FamilleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilleServiceImp implements FamilleService{
    @Autowired
    private FamilleRepository familleRepository;

    @Override
    public ResponseEntity<Famille> addFamille(Famille famille) {
        return ResponseEntity.ok().body(familleRepository.save(famille));
    }

    @Override
    public ResponseEntity<List<Famille>> getFamilles() {
        List<Famille> familles = familleRepository.findAll();
        familles.forEach(fi -> System.out.println("Famille trouvée : " + fi.getIdFamille() + " - " + fi.getNomFamille()));
        return ResponseEntity.ok().body(familles);
    }
}
