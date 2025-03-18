package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FicheService {
    Fiche addFiche(Fiche fiche , MultipartFile file);
    List<Fiche> getFiches();
    Fiche updateFiche(Fiche fiche );
    Fiche deleteFiche(long idFiche , long idSupprimateur );
    Fiche ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus Status , String commentaire);
    Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , String ficheAQL);
    List<Fiche> getFichesByPreparateur(Long idPreparateur);
    List<Fiche> getFichesSheetByIPDF(Long idIPDF);
    List<Fiche> getFichesSheetByIQP(Long idIQP);
}
