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
    private NotificationService nService;

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
        nService.notifyIPDFAboutFicheInjection(fiche);
        return ficheRepository.save(fiche);
    }

    @Override
    public List<Fiche> getFiches() {
        return ficheRepository.findByActionNot(Fiche.FicheAction.DELETE);
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

        fiche.setStatus(Fiche.FicheStatus.PENDING); // najmou nahiwha fel mba3d kif na3mlou el frontend w nabaathouha direct maa el data JSON
        fiche.setAction(Fiche.FicheAction.UPDATE); // najmou nahiwha fel mba3d kif na3mlou el frontend w nabaathouha direct maa el data JSON
        return ficheRepository.save(fiche);

    }

    @Override
    public Fiche deleteFiche(long idFiche, long idSupprimateur) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idSupprimateur).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        fiche.setStatus(Fiche.FicheStatus.DELETED);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.DELETE);
        return ficheRepository.save(fiche);
    }

    @Override
    public Fiche ValidationIPDF(long idFiche, long idIPDF , Fiche.FicheStatus status , String commentaire) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        fiche.setCommentaire(commentaire);
        fiche.setStatus(status);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.APPROUVE);

        return ficheRepository.save(fiche);
    }

    @Override
    public Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , byte[] ficheAQL) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("actionneur introuvable"));
        //khallit status en cas ou el iqp tla3 zeda ynajjem yrejecti ficha
        fiche.setStatus(Fiche.FicheStatus.ACCEPTEDIQP);
        fiche.setFicheAQL(ficheAQL);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.APPROUVE);
        return ficheRepository.save(fiche);
    }

    public List<Fiche> getFichesByPreparateur(Long idPreparateur) {
        User preparateur = userRepository.findById(idPreparateur).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(preparateur.getRole());
        if(preparateur.getRole().equals(Role.PREPARATEUR ) || preparateur.getRole().equals(Role.SUPERUSER)){
            return ficheRepository.findFicheByPreparateurAndActionNot(preparateur , Fiche.FicheAction.DELETE);
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle Preparateur requis.");
        }
    }

    public List<Fiche> getFichesSheetByIPDF(Long idIPDF) {
        User ipdf = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(ipdf.getRole());
        if(ipdf.getRole().equals(Role.IPDF) || ipdf.getRole().equals(Role.SUPERUSER) ){
            return ficheRepository.findFicheByIPDFAndActionNot(ipdf , Fiche.FicheAction.DELETE);
        }
        throw new RuntimeException("L'utilisateur n'a pas le rôle IPDF requis.");
    }
    public List<Fiche> getFichesSheetByIQP(Long idIQP) {
        User iqp = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(iqp.getRole());
        if(iqp.getRole().equals(Role.IQP) || iqp.getRole().equals(Role.SUPERUSER)){
            return  ficheRepository.findFicheByIQPAndActionNot(iqp , Fiche.FicheAction.DELETE );
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle IQP requis.");
        }
    }
}
