package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FicheService {
    ResponseEntity<Fiche> addFiche(Fiche fiche);
    ResponseEntity<List<Fiche>> getFiches();
}
