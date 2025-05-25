package com.pfe.backend.Service.ServiceProduit;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.FicheRepository;
import com.pfe.backend.Repository.ProduitRepository;
import com.pfe.backend.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProduitServiceImp implements ProduitService {
    @Autowired
    private ProduitRepository produitRepository;
    private FamilleRepository familleRepository;
    private UserRepository userRepo;
    private FicheRepository ficheRepo;
    private UserRepository userRepository;

    @Override
    public ResponseEntity<?> addProduit(Produit produit, Long idFamille, Long idActionneur) {
        Famille famille = familleRepository.findById(idFamille).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
        User actionneur = userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        if (produit.getNomProduit() == null || produit.getNomProduit().isEmpty()) {
            produit.setNomProduit(produit.getRef() + "-" + produit.getIndice());
        }

        Optional<Produit> existingProduit = produitRepository.findByIndiceAndRefAndIsDeleted(produit.getIndice(),produit.getRef(),false);
        if (existingProduit.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Un produit avec le même nom existe déjà");
        }
        produit.setFamille(famille);
        produit.setActionneur(actionneur);
        Produit savedProduit = produitRepository.save(produit);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduit);
    }

    @Override
    public ResponseEntity<List<Produit>> getAllProduit() {
        return ResponseEntity.ok().body(produitRepository.findAll());
    }
      @Override
       public ResponseEntity<?> updateProduit(Long idProduit, Long idFamille, Produit newProduitData ,Long idActionneur)
        {
            Famille famille = familleRepository.findById(idFamille).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
            Produit produit = produitRepository.findById(idProduit).orElseThrow(() -> new RuntimeException("Produit introuvable"));
            User actionneur = userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

            Optional<Produit> existingProduit = produitRepository.findByIndiceAndRefAndIsDeleted(newProduitData.getIndice(),newProduitData.getRef(),false);
            if (existingProduit.isPresent() && existingProduit.get().getIdProduit() != idProduit) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Un produit avec le même indice et reference existe déjà");
            }

            if(newProduitData.getNomProduit()!=null ) {
                if (newProduitData.getNomProduit().isEmpty()) {
                    newProduitData.setNomProduit(newProduitData.getRef() + "-" + newProduitData.getIndice());
                }else if(newProduitData.getNomProduit().equals(produit.getRef() + "-" + produit.getIndice())) {
                    newProduitData.setNomProduit(newProduitData.getRef() + "-" + newProduitData.getIndice());
                }
                produit.setNomProduit(newProduitData.getNomProduit());
            };
            if(newProduitData.getRef()!=null ) produit.setRef(newProduitData.getRef());
            if(newProduitData.getIndice()!=null ) produit.setIndice(newProduitData.getIndice());
            produit.setFamille(famille);
            produit.setActionneur(actionneur);
            return ResponseEntity.status(HttpStatus.CREATED).body(produitRepository.save(produit));
        }
        @Override
        public void DeleteProduit(Long idProduit ,Long idActionneur)
        {
            System.out.println("test 63625214");
            System.out.println(idProduit);
            System.out.println(idActionneur);

            Produit prod = produitRepository.findById(idProduit)
                    .orElseThrow(() -> new RuntimeException("produit introuvable"));
            User actionneur = userRepo.findById(idActionneur)
                    .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
            prod.setDeleted(true);
            prod.setActionneur(actionneur);
            List<Fiche> fiches = ficheRepo.findByProduit(prod);
            for (Fiche fiche : fiches) {
                if(fiche.getStatus() != Fiche.FicheStatus.DELETED){
                    fiche.setStatus(Fiche.FicheStatus.DELETED);
                    fiche.setAction(Fiche.FicheAction.DELETE);
                    fiche.setActionneur(actionneur);
                }

            }
            ficheRepo.saveAll(fiches);
            produitRepository.save(prod);
        }
    @Override
    public List<Produit> getActiveProducts() {
        return produitRepository.findByIsDeletedFalse();
    }

    @Override
    public List<Produit> getProduitsByUserZones(Long idUser) {
        User user = userRepository.findById(idUser).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        return user.getUserZones().stream()
                .map(UserZone::getZone)
                .flatMap(zone -> zone.getFamilles().stream())
                .flatMap(famille -> famille.getProduits().stream())
                .filter(produit -> !produit.isDeleted())
                .distinct()
                .collect(Collectors.toList());

    }

}
