package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Repository.FicheRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FicheServiceImp implements FicheService {

    @Autowired
    private FicheRepository fRepository;

    @Override
    public ResponseEntity<Fiche> addFiche(Fiche fiche) {
        return ResponseEntity.ok().body(fRepository.save(fiche));
    }

    @Override
    public ResponseEntity<List<Fiche>> getFiches() {
        return ResponseEntity.ok().body(fRepository.findAll());
    }


}
