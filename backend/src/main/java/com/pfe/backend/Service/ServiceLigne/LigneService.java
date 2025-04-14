package com.pfe.backend.Service.ServiceLigne;

import com.pfe.backend.Model.Ligne;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface LigneService {
    ResponseEntity<?> addLigne(Ligne ligne , Long idActionneur);
    ResponseEntity<?> updateLigne(Long idLigne, Ligne NewLigneData , Long idActionneur);
    void DeleteLigne(Long idLigne ,Long idActionneur);
    List<Ligne> getActiveLignes();
    List<Ligne> getLignes();
}
