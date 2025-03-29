package com.pfe.backend.Service;

import com.pfe.backend.Model.Famille;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FamilleService {
    ResponseEntity<?> addFamille(Famille famille, Long idActionneur);
    ResponseEntity<List<Famille>> getFamilles();
    void updateFamily(Long idFam, Famille newFamillyData ,Long idActionneur);
    void DeleteFamily(Long idFam , Long idActionneur);
    List<Famille> getActiveFamilies();
}
