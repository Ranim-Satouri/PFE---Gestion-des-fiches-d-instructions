package com.pfe.backend.Service.ServiceLigne;


import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.*;
import com.pfe.backend.Service.ServiceOperation.OperationService;
import com.pfe.backend.Service.ServiceUser.UserIservice;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class LigneServiceImp implements LigneService {
    @Autowired
    private UserRepository userRepository;
    private LigneRepository ligneRepository;
    private ZoneRepository zoneRepository;
    private OperationRepository operationRepo;
    private OperationService operationService;
    private UserIservice userService;
    private FicheLigneRepository ficheLigneRepo;

    public ResponseEntity<?> addLigne(Ligne ligne , Long idActionneur){
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Zone zone = zoneRepository.findById(ligne.getZone().getIdZone())
                .orElseThrow(() -> new RuntimeException("zone introuvable"));
        Optional<Ligne> existingLigne = ligneRepository.findBynomAndIsDeletedAndZone(ligne.getNom(), false , ligne.getZone());
        if(existingLigne.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("une ligne avec le même nom et zone existe déjà");
        }
        ligne.setZone(zone);
        ligne.setActionneur(actionneur);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ligneRepository.save(ligne));
    }

    @Override
    public ResponseEntity<?> updateLigne(Long idLigne, Ligne NewLigneData , Long idActionneur)
    {
        Ligne ligne = ligneRepository.findById(idLigne).orElseThrow(()-> new RuntimeException("Ligne introuvable ! "));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Zone zone = zoneRepository.findById(NewLigneData.getZone().getIdZone())
                .orElseThrow(() -> new RuntimeException("zone introuvable"));
        Optional<Ligne> existingLigne = ligneRepository.findBynomAndIsDeletedAndZone(NewLigneData.getNom(), false , NewLigneData.getZone());
        if(existingLigne.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("une ligne avec le même nom et zone existe déjà");
        }
        if(NewLigneData.getNom()!=null ) ligne.setNom(NewLigneData.getNom());
        ligne.setActionneur(actionneur);
        ligne.setZone(zone);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ligneRepository.save(ligne));
    }

    @Override
    public void DeleteLigne(Long idLigne ,Long idActionneur)
    {
        Ligne ligne = ligneRepository.findById(idLigne).orElseThrow(()-> new RuntimeException("Ligne introuvable ! "));
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        List<Operation> operations = operationRepo.findByLigneAndIsDeletedFalse(ligne);
        for (Operation op : operations) {
            operationService.DeleteOperation(op.getIdOperation() , actionneur.getIdUser());
        }
        operationRepo.saveAll(operations);
        List<FicheLigne> fichesLigne = ficheLigneRepo.findByLigneAndStatusNot(ligne , Fiche.FicheStatus.DELETED);
        for (Fiche fiche : fichesLigne) {
            fiche.setStatus(Fiche.FicheStatus.DELETED);
            fiche.setAction(Fiche.FicheAction.DELETE);
            fiche.setActionneur(actionneur);
        }
        ficheLigneRepo.saveAll(fichesLigne);
        ligne.setActionneur(actionneur);
        ligne.setDeleted(true);
        ligneRepository.save(ligne);
    }
    @Override
    public List<Ligne> getActiveLignes() {
        return ligneRepository.findByIsDeletedFalse();
    }

    @Override
    public List<Ligne> getLignes() {
        return ligneRepository.findAll();
    }

    @Override
    public List<Ligne> getLignesByUserZones(long idUser) {

        Set<UserZone> zones = userService.getUserZones(idUser);
        List<Ligne> lignes = new ArrayList<>();
        for (UserZone userzone : zones) {
            lignes.addAll(ligneRepository.findByZoneAndIsDeletedFalse(userzone.getZone()));
        }

        return lignes;
    }

}
