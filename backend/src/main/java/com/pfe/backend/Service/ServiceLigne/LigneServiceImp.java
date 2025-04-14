package com.pfe.backend.Service.ServiceLigne;


import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.LigneRepository;
import com.pfe.backend.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class LigneServiceImp implements LigneService {
    @Autowired
    private UserRepository userRepository;
    private LigneRepository ligneRepository;

    public ResponseEntity<?> addLigne(Ligne ligne , Long idActionneur){
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Ligne> existingLigne = ligneRepository.findBynomAndIsDeleted(ligne.getNom(), false);
        if(existingLigne.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("une ligne avec le même nom existe déjà");
        }
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
        Optional<Ligne> existingLigne = ligneRepository.findBynomAndIsDeleted(ligne.getNom(), false);
        if(existingLigne.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("une ligne avec le même nom existe déjà");
        }
        if(NewLigneData.getNom()!=null ) ligne.setNom(NewLigneData.getNom());
        ligne.setActionneur(actionneur);
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
}
