package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FicheService {
    ResponseEntity<Fiche> addFiche(Fiche fiche);
    ResponseEntity<List<Fiche>> getFiches();
    ResponseEntity<Fiche> updateFiche(Fiche fiche , long idModificateur);
    ResponseEntity<Fiche> deleteFiche(long idFiche , long idSupprimateur );
    ResponseEntity<Fiche> ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus Status , String commentaire);
    ResponseEntity<Fiche> ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , byte[] ficheAQL);

}
