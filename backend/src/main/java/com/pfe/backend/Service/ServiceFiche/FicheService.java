package com.pfe.backend.Service.ServiceFiche;

import com.pfe.backend.DTO.FicheHistoryDTO;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheLigne;
import com.pfe.backend.Model.FicheOperation;
import com.pfe.backend.Model.FicheZone;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FicheService {
    //Fiche addFiche(Fiche fiche);
    List<Fiche> getFiches();
    //Fiche updateFiche(Fiche fiche );
    Fiche deleteFiche(long idFiche , long idSupprimateur );
    Fiche ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus Status , String commentaire);
    Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status ,String ficheAql,String commentaire);
//    List<Fiche> getFichesByPreparateur(Long idPreparateur);
//    List<Fiche> getFichesSheetByIPDF(Long idIPDF);
//    List<Fiche> getFichesSheetByIQP(Long idIQP);
    String saveFile(MultipartFile file) throws  Exception;
    Resource loadPdf(String filename) throws Exception;
    List<Fiche> getFichesSheetByOperateur(Long idOperateur);
    List<Fiche> getFichesSheetByAdmin(Long idAdmin);
    boolean verifierEtMettreAJourFichesExpirees();
    FicheOperation addFicheOperation(FicheOperation fiche);
    FicheZone addFicheZone(FicheZone fiche);
    FicheLigne addFicheLigne(FicheLigne fiche);
    Fiche updateFicheZone(FicheZone ficheZone);
    Fiche updateFicheLigne(FicheLigne ficheLigne);
    Fiche updateFicheOperation(FicheOperation ficheOperation);
    List<Fiche> getFichesSheetByUserZones(Long idUser);
    List<FicheHistoryDTO> getFicheHistory(Long ficheId);
    List<Fiche> rechercheAvancee(String requete, Long idUser, List<String> situations);
}
