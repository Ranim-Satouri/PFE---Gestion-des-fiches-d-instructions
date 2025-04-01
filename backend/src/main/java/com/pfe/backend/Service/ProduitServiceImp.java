package com.pfe.backend.Service;
import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.FicheRepository;
import com.pfe.backend.Repository.ProduitRepository;
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
public class ProduitServiceImp implements ProduitService{
    @Autowired
    private ProduitRepository produitRepository;
    private FamilleRepository familleRepository;
    private UserRepository userRepo;
    private FicheRepository ficheRepo;

    @Override
    public ResponseEntity<?> addProduit(Produit produit, Long idFamille, Long idActionneur) {
        Optional<Famille> familleOpt = familleRepository.findById(idFamille);
        if (familleOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Famille introuvable");
        }

        Optional<User> actionneurOpt = userRepo.findById(idActionneur);
        if (actionneurOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Actionneur introuvable");
        }

        if (produit.getNomProduit() == null || produit.getNomProduit().isEmpty()) {
            produit.setNomProduit(produit.getRef() + "-" + produit.getIndice());
        }

        Optional<Produit> existingProduit = produitRepository.findByIndiceAndRefAndIsDeleted(produit.getIndice(),produit.getRef(),false);
        if (existingProduit.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Un produit avec le même nom existe déjà");
        }

        produit.setFamille(familleOpt.get());
        produit.setActionneur(actionneurOpt.get());
        Produit savedProduit = produitRepository.save(produit);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduit);
    }

    @Override
    public ResponseEntity<List<Produit>> getAllProduit() {
        return ResponseEntity.ok().body(produitRepository.findAll());
    }
      @Override
       public void updateProduit(Long idProduit, Produit newProduitData ,Long idActionneur)
        {
            Produit produit = produitRepository.findById(idProduit).orElseThrow(()-> new RuntimeException("Produit introuvable ! "));
            User actionneur = userRepo.findById(idActionneur)
                    .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
            if(newProduitData.getNomProduit()!=null ) produit.setNomProduit(newProduitData.getNomProduit());
            if(newProduitData.getRef()!=null ) produit.setRef(newProduitData.getRef());
            if(newProduitData.getIndice()!=null ) produit.setIndice(newProduitData.getIndice());
            if(newProduitData.getFamille()!=null ) produit.setFamille(newProduitData.getFamille());
            produit.setActionneur(actionneur);
            produitRepository.save(produit);
        }
        @Override
        public void DeleteProduit(Long idProduit ,Long idActionneur)
        {
            Produit prod = produitRepository.findById(idProduit)
                    .orElseThrow(() -> new RuntimeException("produit introuvable"));
            User actionneur = userRepo.findById(idActionneur)
                    .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
            prod.setDeleted(true);
            prod.setActionneur(actionneur);
            List<Fiche> fiches = ficheRepo.findByProduit(prod);
            for (Fiche fiche : fiches) {
                fiche.setStatus(Fiche.FicheStatus.DELETED);
                fiche.setAction(Fiche.FicheAction.DELETE);
                fiche.setActionneur(actionneur);
            }
            ficheRepo.saveAll(fiches);
//            prod.getUserZones().clear();
            produitRepository.save(prod);
        }
    @Override
    public List<Produit> getActiveProducts() {
        return produitRepository.findByIsDeletedFalse();
    }
}
