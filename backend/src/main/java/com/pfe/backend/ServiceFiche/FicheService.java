package com.pfe.backend.ServiceFiche;

import com.pfe.backend.Model.Fiche;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FicheService {
    Fiche addFiche(Fiche fiche , MultipartFile file);
    List<Fiche> getFiches();
    Fiche updateFiche(Fiche fiche , MultipartFile file);
    Fiche deleteFiche(long idFiche , long idSupprimateur );
    Fiche ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus Status , String commentaire);
    Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , MultipartFile file);
    List<Fiche> getFichesByPreparateur(Long idPreparateur);
    List<Fiche> getFichesSheetByIPDF(Long idIPDF);
    List<Fiche> getFichesSheetByIQP(Long idIQP);
    String saveFile(MultipartFile file) throws IOException , Exception;
    Resource loadPdf(String filename) throws Exception;
}
