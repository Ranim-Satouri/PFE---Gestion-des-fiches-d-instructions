package com.pfe.backend.ServiceFiche;

import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FicheRepository;
import com.pfe.backend.Repository.ProduitRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import com.pfe.backend.ServiceMail.NotificationService;
import com.pfe.backend.configuration.EncryptionUtils;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.crypto.SecretKey;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class FicheServiceImp implements FicheService {

    @Autowired
    private FicheRepository ficheRepository;
    private UserRepository userRepository;
    private ProduitRepository produitRepository;
    private ZoneRepository zoneRepository;
    private NotificationService nService;

    private static final String STORAGE_DIR = "C:\\Users\\Ranim\\Desktop\\pdf_storage\\";

    @Override
    public Fiche addFiche(Fiche fiche ) {
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
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        //nService.notifyIPDFAboutFicheInjection(fiche);
        List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        for(User u : superUsers){
           // nService.notifySuperUserAboutNewFiche(fiche, u);
        }
        return ficheRepository.save(fiche);
    }


    @Override
    public String saveFile(MultipartFile file) throws Exception {

        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        File uploadDir = new File(STORAGE_DIR); //tjib el dossier
        if (!uploadDir.exists()) uploadDir.mkdirs(); // Créer le dossier s'il n'existe pas

        // Générer un nom unique
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        //String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename(); // autre facon

        // Charger ou générer la clé de chiffrement unique
        SecretKey secretKey = EncryptionUtils.loadOrGenerateEncryptionKey();

        // Crypter les données du fichier
        byte[] encryptedData = EncryptionUtils.encrypt(file.getBytes(), secretKey);

        // Définir le chemin complet bech taamel bih write
        Path destinationPath = Path.of(STORAGE_DIR + fileName);

        // Sauvegarder le fichier chiffré
        Files.write(destinationPath, encryptedData);

        return fileName; // Retourne juste le nom du fichier
    }

    @Override
    public Resource loadPdf(String filename) {
        try {
            // générer la clé de chiffrement unique (ken ma fammech bech yasna3 wehed)
            SecretKey secretKey = EncryptionUtils.loadOrGenerateEncryptionKey();

            // Charger le fichier chiffré bel esm te3ou
            Path filePath = Paths.get(STORAGE_DIR).resolve(filename); //ijib el dossier
            byte[] encryptedData = Files.readAllBytes(filePath); // ijib el file

            // Déchiffrer le fichier
            byte[] decryptedData = EncryptionUtils.decrypt(encryptedData, secretKey);

            // Retourner le fichier sous forme de ByteArrayResource
            return new ByteArrayResource(decryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du chargement du fichier PDF : " + filename, e);
        }
    }



    @Override
    public List<Fiche> getFiches() {
        return ficheRepository.findByStatusNot(Fiche.FicheStatus.DELETED);
    }

    @Override
    public Fiche updateFiche(Fiche fiche ) {
        Fiche exisitingFiche = ficheRepository.findById(fiche.getIdFiche()).orElseThrow(() -> new RuntimeException("Fiche introuvable"));

        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        Zone zone = zoneRepository.findById(fiche.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));;
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        //if(!exisitingFiche.getStatus().equals(Fiche.FicheStatus.PENDING) && !actionneur.getRole().equals(Role.SUPERUSER)){
          //  throw new RuntimeException("Interdit de Modifier une fiche deja Approuver sans etre un SUPERUSR");
        //}
        exisitingFiche.setPdf(fiche.getPdf());
        exisitingFiche.setIPDF(ipdf);
        exisitingFiche.setIQP(iqp);
        exisitingFiche.setPreparateur(preparateur);
        exisitingFiche.setProduit(produit);
        exisitingFiche.setZone(zone);
        exisitingFiche.setActionneur(actionneur);
        exisitingFiche.setStatus(fiche.getStatus());
        exisitingFiche.setAction(Fiche.FicheAction.UPDATE); // najmou nahiwha fel mba3d kif na3mlou el frontend w nabaathouha direct maa el data JSON
        return ficheRepository.save(exisitingFiche);
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

        List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        if(status.equals(Fiche.FicheStatus.ACCEPTEDIPDF)){
            //nService.notifyPreparateurAboutIPDFAcceptance(fiche);
            for(User u : superUsers){
                //nService.notifySuperUserAboutIPDFValidation(fiche, u);
            }
            //nService.notifyIQPAboutFicheValidationByIPDF(fiche);
        }else{
            //nService.notifyPreparateurAboutIPDFRejection(fiche);
            for(User u : superUsers){
                //nService.notifySuperUserAboutIPDFRejection(fiche, u);
            }
        }
        return ficheRepository.save(fiche);
    }

    @Override
    public Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status , MultipartFile file) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("actionneur introuvable"));
        //khallit status en cas ou el iqp tla3 zeda ynajjem yrejecti ficha
        fiche.setStatus(status);
        // Traitement du fichier si présent
        if (file != null && !file.isEmpty()) {
            try{
                String pdfPath = saveFile(file);
                fiche.setFicheAQL(pdfPath);
            }catch (Exception e){
                throw new RuntimeException("Problème lors du stockage du fichier PDF : " + e.getMessage(), e);
            }
        }
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.APPROUVE);
        //nService.notifyPreparateurAboutFicheFinalValidation(fiche);
        List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        for(User u : superUsers){
            //nService.notifySuperUserAboutAQLAddition(fiche, u);
        }
        return ficheRepository.save(fiche);
    }

    @Override
    public List<Fiche> getFichesByPreparateur(Long idPreparateur) {
        User preparateur = userRepository.findById(idPreparateur).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(preparateur.getRole());
        if(preparateur.getRole().equals(Role.PREPARATEUR ) || preparateur.getRole().equals(Role.SUPERUSER)){
            return ficheRepository.findFicheByPreparateurAndActionNot(preparateur , Fiche.FicheAction.DELETE);
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle Preparateur requis.");
        }
    }

    @Override
    public List<Fiche> getFichesSheetByIPDF(Long idIPDF) {
        User ipdf = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(ipdf.getRole());
        if(ipdf.getRole().equals(Role.IPDF) || ipdf.getRole().equals(Role.SUPERUSER) ){
            return ficheRepository.findFicheByIPDFAndActionNot(ipdf , Fiche.FicheAction.DELETE );
        }
        throw new RuntimeException("L'utilisateur n'a pas le rôle IPDF requis.");
    }

    @Override
    public List<Fiche> getFichesSheetByIQP(Long idIQP) {
        User iqp = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        System.out.println(iqp.getRole());
        if(iqp.getRole().equals(Role.IQP) || iqp.getRole().equals(Role.SUPERUSER)){
            return  ficheRepository.findFicheByIQPAndActionNotAndStatusNot(iqp , Fiche.FicheAction.DELETE , Fiche.FicheStatus.REJECTEDIPDF );
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle IQP requis.");
        }
    }
    @Override
    public List<Fiche> getFichesSheetByOperateur(Long idOperateur) {
        User operateur = userRepository.findById(idOperateur).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = operateur.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for(UserZone u : zones){
            fiches.addAll(ficheRepository.findByZoneAndStatus(u.getZone() , Fiche.FicheStatus.ACCEPTEDIQP));
        }
        return  fiches;
    }
    @Override
    public List<Fiche> getFichesSheetByAdmin(Long idAdmin) {
        User admin = userRepository.findById(idAdmin).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = admin.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for(UserZone u : zones){
            fiches.addAll(ficheRepository.findByZone(u.getZone()));
        }
        return  fiches;
    }

}
