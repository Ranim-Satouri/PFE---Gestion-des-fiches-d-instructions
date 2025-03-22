package com.pfe.backend.Service;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.FamilleRepository;
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
    @Autowired
    private FamilleRepository familleRepository;
    @Autowired
    private UserRepository userRepo;
    @Override
    public Produit addProduit(Produit produit, Long idFamille, Long idActionneur) {
        Famille famille = familleRepository.findById(idFamille)
                .orElseThrow(() -> new RuntimeException("Famille introuvable"));
        User actionneur = userRepo.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        if (produit.getNomProduit() == null || produit.getNomProduit().isEmpty()) {
            produit.setNomProduit(produit.getRef() + "-" + produit.getIndice());
        }
        Optional<Produit> existingProduitByNom = produitRepository.findByNomProduit(produit.getNomProduit());
        if (existingProduitByNom.isPresent()) {
            throw new RuntimeException("Un produit avec le même nom existe déjà");
        }
        produit.setFamille(famille);
        produit.setActionneur(actionneur);
        return produitRepository.save(produit);
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
        public void DeleteProduit(Long idProduit)
        {
            Produit prod = produitRepository.findById(idProduit)
                    .orElseThrow(() -> new RuntimeException("produit introuvable"));
            prod.setDeleted(true);
//            prod.getUserZones().clear();
            produitRepository.save(prod);
        }
    @Override
    public List<Produit> getActiveProducts() {
        return produitRepository.findByIsDeletedFalse();
    }
}
