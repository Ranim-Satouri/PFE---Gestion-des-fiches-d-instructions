package com.pfe.backend.Service.ServiceOperation;

import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FicheOperationRepository;
import com.pfe.backend.Repository.LigneRepository;
import com.pfe.backend.Repository.OperationRepository;
import com.pfe.backend.Repository.UserRepository;
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
public class OperationServiceImp implements OperationService {
    @Autowired
    private UserRepository userRepository;
    private OperationRepository operationRepository;
    private LigneRepository ligneRepository;
    private FicheOperationRepository ficheOperationRepo;
    private UserIservice userService;

    public ResponseEntity<?> addOperation(Operation operation , Long idActionneur){
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Ligne ligne = ligneRepository.findById(operation.getLigne().getIdLigne())
                .orElseThrow(() -> new RuntimeException("ligne introuvable"));
        Optional<Operation> existingOperation = operationRepository.findBynomAndIsDeletedAndLigne(operation.getNom(), false , operation.getLigne());
        if(existingOperation.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("une operation avec le même nom existe déjà");
        }

        operation.setActionneur(actionneur);
        operation.setLigne(ligne);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(operationRepository.save(operation));
    }

    @Override
    public ResponseEntity<?> updateOperation(Long idOperation, Operation NewOperationData , Long idActionneur)
    {
        Operation operation = operationRepository.findById(idOperation).orElseThrow(()-> new RuntimeException("Operation introuvable ! "));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Operation> existingOperation = operationRepository.findBynomAndIsDeletedAndLigne(NewOperationData.getNom(), false,NewOperationData.getLigne());
        Ligne ligne = ligneRepository.findById(NewOperationData.getLigne().getIdLigne())
                .orElseThrow(() -> new RuntimeException("ligne introuvable"));
        if(existingOperation.isPresent()){
            if(existingOperation.get().getIdOperation() != idOperation) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("une operation avec le même nom existe déjà");
            }
        }
        if(NewOperationData.getNom()!=null ) operation.setNom(NewOperationData.getNom());
        operation.setActionneur(actionneur);
        operation.setLigne(ligne);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(operationRepository.save(operation));
    }

    @Override
    public void DeleteOperation(Long idOperation ,Long idActionneur)
    {
        Operation operation = operationRepository.findById(idOperation).orElseThrow(()-> new RuntimeException("Operation introuvable ! "));
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        List<FicheOperation> fichesOp = ficheOperationRepo.findByOperationAndStatusNot(operation , Fiche.FicheStatus.DELETED);
        for (Fiche fiche : fichesOp) {
            fiche.setStatus(Fiche.FicheStatus.DELETED);
            fiche.setAction(Fiche.FicheAction.DELETE);
            fiche.setActionneur(actionneur);
        }
        ficheOperationRepo.saveAll(fichesOp);
        operation.setActionneur(actionneur);
        operation.setDeleted(true);
        operationRepository.save(operation);
    }
    @Override
    public List<Operation> getActiveOperations() {
        return operationRepository.findByIsDeletedFalse();
    }

    @Override
    public List<Operation> getOperations() {
        return operationRepository.findAll();
    }

    @Override
    public List<Operation> getOperationsByUserZones(long idUser) {

        Set<UserZone> zones = userService.getUserZones(idUser);
        List<Ligne> lignes = new ArrayList<>();
        for (UserZone userzone : zones) {
            lignes.addAll(ligneRepository.findByZoneAndIsDeletedFalse(userzone.getZone()));
        }
        List<Operation> operations = new ArrayList<>();

        for (Ligne ligne : lignes) {
            operations.addAll(operationRepository.findByLigneAndIsDeletedFalse(ligne));
        }
        return operations;
    }
}
