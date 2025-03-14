package com.pfe.backend.Service;

import com.pfe.backend.Model.Famille;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FamilleService {
    ResponseEntity<Famille> addFamille(Famille famille);
    ResponseEntity<List<Famille>> getFamilles();
}
