package com.pfe.backend.Service;

import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FicheRepository;

import com.pfe.backend.Repository.ProduitRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class FicheServiceImp implements FicheService {

    @Autowired
    private FicheRepository ficheRepository;
    private UserRepository userRepository;
    private ProduitRepository produitRepository;
    private ZoneRepository zoneRepository;

    @Override
    public Fiche addFiche(Fiche fiche) {

        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));;
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));;
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));;
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));;
        Zone zone = zoneRepository.findById(fiche.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));;
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));;

        fiche.setIPDF(ipdf);
        fiche.setIQP(iqp);
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setZone(zone);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        return ficheRepository.save(fiche);
    }

    @Override
    public List<Fiche> getFiches() {
        return ficheRepository.findAll();
    }

    @Override
    public Fiche updateFiche(Fiche fiche) {

        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        Zone zone = zoneRepository.findById(fiche.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));;
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        fiche.setIPDF(ipdf);
        fiche.setIQP(iqp);
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setZone(zone);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.UPDATE);
        return ficheRepository.save(fiche);


    }

    @Override
    public Fiche deleteFiche(long idFiche, long idSupprimateur) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idSupprimateur).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        Fiche ficheDeleted = fiche;
        ficheDeleted.setStatus(Fiche.FicheStatus.DELETED);
        ficheDeleted.setActionneur(actionneur);
        ficheDeleted.setAction(Fiche.FicheAction.DELETE);
        return ficheRepository.save(ficheDeleted);
    }

    @Override
    public Fiche ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus status , String commentaire) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        Fiche ficheipdf = fiche;
        ficheipdf.setCommentaire(commentaire);
        ficheipdf.setStatus(status);
        ficheipdf.setActionneur(actionneur);
        ficheipdf.setAction(Fiche.FicheAction.APPROUVE);
        return ficheRepository.save(ficheipdf);

    }

    @Override
    public Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , byte[] ficheAQL) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        Fiche ficheiqp = fiche;
        ficheiqp.setStatus(Fiche.FicheStatus.ACCEPTEDIQP);
        ficheiqp.setFicheAQL(ficheAQL);
        ficheiqp.setActionneur(actionneur);
        ficheiqp.setAction(Fiche.FicheAction.APPROUVE);
        return ficheRepository.save(ficheiqp);
    }

    public List<Fiche> getFichesByPreparateur(Long idPreparateur) {
        User preparateur = userRepository.findById(idPreparateur).orElseThrow(() -> new RuntimeException("user introuvable"));
        if(preparateur.getRole().equals(Role.PREPARATEUR)){
            return ficheRepository.findFicheByPreparateur(preparateur);
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle Preparateur requis.");
        }
    }

    public List<Fiche> getFichesSheetByIPDF(Long idIPDF) {
        User ipdf = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("user introuvable"));
        if(ipdf.getRole().equals(Role.PREPARATEUR)){
            return ficheRepository.findFicheByIPDF(ipdf);
        }
        throw new RuntimeException("L'utilisateur n'a pas le rôle IPDF requis.");
    }
    public List<Fiche> getFichesSheetByIQP(Long idIQP) {
        User iqp = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("user introuvable"));
        if(iqp.getRole().equals(Role.PREPARATEUR)){
            return ficheRepository.findFicheByIQP(iqp);
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle IQP requis.");
        }

    }



}
