package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.FicheRepository;

import com.pfe.backend.Repository.ProduitRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FicheServiceImp implements FicheService {

    @Autowired
    private FicheRepository ficheRepository;
    private UserRepository userRepository;
    private ProduitRepository produitRepository;
    private ZoneRepository zoneRepository;
    private FicheAuditService ficheAuditService;


    @Override
    public ResponseEntity<Fiche> addFiche(Fiche fiche) {

        Optional<User> ipdf = userRepository.findById(fiche.getIPDF().getIdUser());
        Optional<User> iqp = userRepository.findById(fiche.getIQP().getIdUser());
        Optional<User> preparateur = userRepository.findById(fiche.getPreparateur().getIdUser());
        Optional<Produit> produit = produitRepository.findById(fiche.getProduit().getIdProduit());
        Optional<Zone> zone = zoneRepository.findById(fiche.getZone().getIdZone());

        if(ipdf.isPresent() && iqp.isPresent() && preparateur.isPresent() && produit.isPresent() && zone.isPresent()) {
            fiche.setIPDF(ipdf.get());
            fiche.setIQP(iqp.get());
            fiche.setPreparateur(preparateur.get());
            fiche.setProduit(produit.get());
            fiche.setZone(zone.get());
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }


        return ResponseEntity.ok().body(ficheRepository.save(fiche));
    }

    @Override
    public ResponseEntity<List<Fiche>> getFiches() {
        return ResponseEntity.ok().body(ficheRepository.findAll());
    }

    @Override
    public ResponseEntity<Fiche> updateFiche(Fiche fiche, long idModificateur) {

        Optional<User> ipdf = userRepository.findById(fiche.getIPDF().getIdUser());
        Optional<User> iqp = userRepository.findById(fiche.getIQP().getIdUser());
        Optional<User> preparateur = userRepository.findById(fiche.getPreparateur().getIdUser());
        Optional<Produit> produit = produitRepository.findById(fiche.getProduit().getIdProduit());
        Optional<Zone> zone = zoneRepository.findById(fiche.getZone().getIdZone());

        if(ipdf.isPresent() && iqp.isPresent() && preparateur.isPresent() && produit.isPresent() && zone.isPresent()) {
            fiche.setIPDF(ipdf.get());
            fiche.setIQP(iqp.get());
            fiche.setPreparateur(preparateur.get());
            fiche.setProduit(produit.get());
            fiche.setZone(zone.get());
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok().body(ficheRepository.save(fiche));
    }

    @Override
    public ResponseEntity<Fiche> deleteFiche(long idFiche, long idSupprimateur) {
        Optional<Fiche> fiche = ficheRepository.findById(idFiche);
        if(fiche.isPresent()) {
            Fiche ficheDeleted = fiche.get();
            ficheDeleted.setStatus(Fiche.FicheStatus.DELETED);

            return ResponseEntity.ok().body(ficheRepository.save(ficheDeleted));
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Override
    public ResponseEntity<Fiche> ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus status , String commentaire) {
        Optional<Fiche> fiche = ficheRepository.findById(idFiche);
        if(fiche.isPresent()) {
            Fiche ficheipdf = fiche.get();
            ficheipdf.setCommentaire(commentaire);
            ficheipdf.setStatus(status);
            return ResponseEntity.ok().body(ficheRepository.save(ficheipdf));
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Override
    public ResponseEntity<Fiche> ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , byte[] ficheAQL) {
        Optional<Fiche> fiche = ficheRepository.findById(idFiche);
        if(fiche.isPresent()) {
            Fiche ficheiqp = fiche.get();
            ficheiqp.setStatus(Fiche.FicheStatus.ACCEPTEDIQP);
            ficheiqp.setFicheAQL(ficheAQL);

            return ResponseEntity.ok().body(ficheRepository.save(ficheiqp));
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }



}
