package com.pfe.backend.ServiceFiche;

import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.*;
import com.pfe.backend.ServiceMail.NotificationService;
import com.pfe.backend.configuration.EncryptionUtils;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.crypto.SecretKey;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class FicheServiceImp implements FicheService {

    @Autowired
    private FicheRepository ficheRepository;
    private UserRepository userRepository;
    private ProduitRepository produitRepository;
    private ZoneRepository zoneRepository;
    private FicheOperationRepository ficheOperationRepository;
    private FicheZoneRepository ficheZoneRepository;
    private FicheLigneRepository ficheLigneRepository;
    private LigneRepository ligneRepository;
    private OperationRepository operationRepository;
    private NotificationService nService;

    private static final String STORAGE_DIR = "C:\\Users\\Ranim\\Desktop\\pdf_storage\\";

//    @Override
//    public Fiche addFiche(Fiche fiche) {
//        System.out.println(fiche);
//
//        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));;
//        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));;
//        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));;
//        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));;
//        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));;

//        if ("ZONE".equals(fiche.getTypeFiche())) {
//            Zone zone = zoneRepository.findById(fiche.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
//            fiche.setZone(zone);
//
//        } else if ("LIGNE".equals(fiche.getTypeFiche())) {
//            System.out.println("ligne");
//
//            Ligne ligne = ligneRepository.findById(fiche.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
//            fiche.setLigne(ligne);
//            fiche.setZone(ligne.getZone());
//
//        } else if ("OPERATION".equals(fiche.getTypeFiche())) {
//            System.out.println("operation");
//
//            Operation operation = operationRepository.findById(fiche.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
//            fiche.setOperation(operation);
//            fiche.setLigne(operation.getLigne());
//            fiche.setZone(operation.getLigne().getZone());
//        } else {
//            throw new RuntimeException("Type de fiche invalide");
//        }
// Utilisation du polymorphisme
//        if (fiche instanceof FicheZone) {
//            FicheZone ficheZone = (FicheZone) fiche;
//            Zone zone = zoneRepository.findById(ficheZone.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
//            System.out.println("zone ++++++++++++++++++++++++++++++++ "+ zone.getIdZone());
//            ficheZone.setZone(zone);
//            System.out.println("ficheZone  "+ficheZone.getZone().getIdZone());
//        } else if (fiche instanceof FicheLigne) {
//            FicheLigne ficheLigne = (FicheLigne) fiche;
//            Ligne ligne = ligneRepository.findById(ficheLigne.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
//            ficheLigne.setLigne(ligne);
//            ficheLigne.setZone(ligne.getZone());
//        } else if (fiche instanceof FicheOperation) {
//            FicheOperation ficheOperation = (FicheOperation) fiche;
//            Operation operation = operationRepository.findById(ficheOperation.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
//            ficheOperation.setOperation(operation);
//            ficheOperation.setLigne(operation.getLigne());
//            ficheOperation.setZone(operation.getLigne().getZone());
//        } else {
//            throw new RuntimeException("Type de fiche invalide");
//        }
//        fiche.setIPDF(ipdf);
//        fiche.setIQP(iqp);
//        fiche.setPreparateur(preparateur);
//        fiche.setProduit(produit);
//        fiche.setActionneur(actionneur);
//        fiche.setAction(Fiche.FicheAction.INSERT);
//        fiche.setStatus(Fiche.FicheStatus.PENDING);
//        LocalDateTime currentDateTime = LocalDateTime.now();
//        LocalDateTime expirationDate = currentDateTime.plusHours(24);
//        fiche.setExpirationDate(expirationDate);
//        //nService.notifyIPDFAboutFicheInjection(fiche);
//        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
//        //for(User u : superUsers){
//        // nService.notifySuperUserAboutNewFiche(fiche, u);
//        //}
//        return ficheRepository.save(fiche);
//    }

//    @Override
//    public Fiche updateFiche(Fiche fiche ) {
//        Fiche existingFiche = ficheRepository.findById(fiche.getIdFiche()).orElseThrow(() -> new RuntimeException("Fiche introuvable"));
//        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
//        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
//        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
//        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
//        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
//        System.out.println(fiche.getTypeFiche());
//
//        if (fiche instanceof FicheZone) {
//            Zone zone = zoneRepository.findById(existingFiche.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
//            System.out.println("zone  "+ zone.getIdZone());
//            existingFiche.setZone(zone);
//            System.out.println("typeFiche  "+fiche.getTypeFiche());
//            existingFiche.setLigne(null);
//            existingFiche.setOperation(null);
//        } else if (fiche instanceof FicheLigne) {
//            Ligne ligne = ligneRepository.findById(existingFiche.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
//            existingFiche.setLigne(ligne);
//            existingFiche.setZone(ligne.getZone());
//            existingFiche.setOperation(null);
//        } else if (fiche instanceof FicheOperation) {
//            Operation operation = operationRepository.findById(existingFiche.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
//            existingFiche.setOperation(operation);
//            existingFiche.setLigne(operation.getLigne());
//            existingFiche.setZone(operation.getLigne().getZone());
//        } else {
//            throw new RuntimeException("Type de fiche invalide");
//        }


        //if(!exisitingFiche.getStatus().equals(Fiche.FicheStatus.PENDING) && !actionneur.getRole().equals(Role.SUPERUSER)){
        //  throw new RuntimeException("Interdit de Modifier une fiche deja Approuver sans etre un SUPERUSR");
        //}

//        if(!existingFiche.getPdf().equals(fiche.getPdf())){
//            LocalDateTime currentDateTime = LocalDateTime.now();
//            LocalDateTime expirationDate = currentDateTime.plusHours(24);
//            existingFiche.setExpirationDate(expirationDate);
//            existingFiche.setPdf(fiche.getPdf());
//        }
//        existingFiche.setIPDF(ipdf);
//        existingFiche.setIQP(iqp);
//        existingFiche.setPreparateur(preparateur);
//        existingFiche.setProduit(produit);
//        existingFiche.setActionneur(actionneur);
//        existingFiche.setStatus(fiche.getStatus());
//        existingFiche.setAction(Fiche.FicheAction.UPDATE);
//        return ficheRepository.save(existingFiche);
//    }
    @Override
    public Fiche updateFicheZone(FicheZone ficheZone) {
        FicheZone existingFiche = (FicheZone) ficheRepository.findById(ficheZone.getIdFiche()).orElseThrow(() -> new RuntimeException("FicheZone introuvable"));

        User ipdf = userRepository.findById(ficheZone.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(ficheZone.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(ficheZone.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheZone.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheZone.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Zone zone = zoneRepository.findById(ficheZone.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
        existingFiche.setZone(zone);

        existingFiche.setIPDF(ipdf);
        existingFiche.setIQP(iqp);
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheZone.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);

        return ficheRepository.save(existingFiche);
    }
    @Override
    public Fiche updateFicheLigne(FicheLigne ficheLigne) {
        FicheLigne existingFiche = (FicheLigne) ficheRepository.findById(ficheLigne.getIdFiche())
                .orElseThrow(() -> new RuntimeException("FicheLigne introuvable"));

        User ipdf = userRepository.findById(ficheLigne.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(ficheLigne.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(ficheLigne.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheLigne.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheLigne.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Ligne ligne = ligneRepository.findById(ficheLigne.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
        existingFiche.setLigne(ligne);

        existingFiche.setIPDF(ipdf);
        existingFiche.setIQP(iqp);
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheLigne.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);

        return ficheRepository.save(existingFiche);
    }

    @Override
    public Fiche updateFicheOperation(FicheOperation ficheOperation) {
        FicheOperation existingFiche = (FicheOperation) ficheRepository.findById(ficheOperation.getIdFiche()).orElseThrow(() -> new RuntimeException("FicheOperation introuvable"));

        User ipdf = userRepository.findById(ficheOperation.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(ficheOperation.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(ficheOperation.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheOperation.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheOperation.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Operation operation = operationRepository.findById(ficheOperation.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
        existingFiche.setOperation(operation);

        existingFiche.setIPDF(ipdf);
        existingFiche.setIQP(iqp);
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheOperation.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);

        return ficheRepository.save(existingFiche);
    }



    @Override
    public FicheOperation addFicheOperation(FicheOperation fiche) {
        System.out.println(fiche.getOperation());
        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Operation operation = operationRepository.findById(fiche.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
        fiche.setOperation(operation);
        fiche.setTypeFiche("OPERATION");
        fiche.setIPDF(ipdf);
        fiche.setIQP(iqp);
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);
        //nService.notifyIPDFAboutFicheInjection(fiche);
        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        //for(User u : superUsers){
        // nService.notifySuperUserAboutNewFiche(fiche, u);
        //}
        return ficheOperationRepository.save(fiche);
    }

    @Override
    public FicheZone addFicheZone(FicheZone fiche) {
        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        FicheZone ficheZone = (FicheZone) fiche;
        Zone zone = zoneRepository.findById(ficheZone.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
        ficheZone.setZone(zone);
        fiche.setTypeFiche("ZONE");
        fiche.setIPDF(ipdf);
        fiche.setIQP(iqp);
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);
        //nService.notifyIPDFAboutFicheInjection(fiche);
        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        //for(User u : superUsers){
        // nService.notifySuperUserAboutNewFiche(fiche, u);
        //}
        return ficheZoneRepository.save(fiche);
    }

    @Override
    public FicheLigne addFicheLigne(FicheLigne fiche) {
        User ipdf = userRepository.findById(fiche.getIPDF().getIdUser()).orElseThrow(() -> new RuntimeException("IPDF introuvable"));
        User iqp = userRepository.findById(fiche.getIQP().getIdUser()).orElseThrow(() -> new RuntimeException("IQP introuvable"));
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Ligne ligne = ligneRepository.findById(fiche.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
        fiche.setLigne(ligne);
        fiche.setTypeFiche("LIGNE");

        fiche.setIPDF(ipdf);
        fiche.setIQP(iqp);
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);
        //nService.notifyIPDFAboutFicheInjection(fiche);
        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        //for(User u : superUsers){
        // nService.notifySuperUserAboutNewFiche(fiche, u);
        //}
        return ficheLigneRepository.save(fiche);
    }

    @Override
    public List<Fiche> getFiches() {
        return ficheRepository.findByStatusNot(Fiche.FicheStatus.DELETED);
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
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);
        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        //if(status.equals(Fiche.FicheStatus.ACCEPTEDIPDF)){
            //nService.notifyPreparateurAboutIPDFAcceptance(fiche);
            //for(User u : superUsers){
                //nService.notifySuperUserAboutIPDFValidation(fiche, u);
            //}
            //nService.notifyIQPAboutFicheValidationByIPDF(fiche);
        //}else{
            //nService.notifyPreparateurAboutIPDFRejection(fiche);
            //for(User u : superUsers){
                //nService.notifySuperUserAboutIPDFRejection(fiche, u);
            //}
       // }
        return ficheRepository.save(fiche);
    }

    @Override
    public Fiche ValidationIQP(long idFiche, long idIQP , Fiche.FicheStatus status ,String ficheAql, String commentaire ) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("actionneur introuvable"));
        fiche.setStatus(status);
        if(status.equals(Fiche.FicheStatus.REJECTEDIQP)){
            LocalDateTime currentDateTime = LocalDateTime.now();
            LocalDateTime expirationDate = currentDateTime.plusHours(24);
            fiche.setExpirationDate(expirationDate);
        }
        fiche.setFicheAQL(ficheAql);
        fiche.setCommentaire(commentaire);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.APPROUVE);
        //nService.notifyPreparateurAboutFicheFinalValidation(fiche);
        //List<User> superUsers=userRepository.findByRole(Role.SUPERUSER);
        //for(User u : superUsers){
            //nService.notifySuperUserAboutAQLAddition(fiche, u);
        //}
        return ficheRepository.save(fiche);
    }


    @Override
    public List<Fiche> getFichesByPreparateur(Long idPreparateur) {
        User preparateur = userRepository.findById(idPreparateur).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        if(preparateur.getRole().equals(Role.PREPARATEUR ) || preparateur.getRole().equals(Role.SUPERUSER)){
            return ficheRepository.findFicheByPreparateurAndActionNot(preparateur , Fiche.FicheAction.DELETE);
        }else{
            throw new RuntimeException("L'utilisateur n'a pas le rôle Preparateur requis.");
        }
    }


    @Override
    public boolean verifierEtMettreAJourFichesExpirees() {
        List<Fiche> fichesExpirees = ficheRepository.findByStatusNotAndExpirationDateBefore(Fiche.FicheStatus.EXPIRED,LocalDateTime.now());
        boolean updated = false;
        if(!fichesExpirees.isEmpty()){
            for (Fiche fiche : fichesExpirees) {
                fiche.setStatus(Fiche.FicheStatus.EXPIRED);
                ficheRepository.save(fiche);
            }
            updated = true;
        }
        return updated;
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
    public List<Fiche> getFichesSheetByUserZones(Long idUser) {
        User user = userRepository.findById(idUser).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = user.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for (UserZone u : zones) {
            Zone zone = u.getZone();
            //fiches.addAll(ficheRepository.findFichesByZone(zone));
            fiches.addAll(ficheZoneRepository.findByZoneAndStatusNot(zone, Fiche.FicheStatus.DELETED));
            fiches.addAll(ficheLigneRepository.findByLigneZoneAndStatusNot(zone, Fiche.FicheStatus.DELETED));
            fiches.addAll(ficheOperationRepository.findByOperationLigneZoneAndStatusNot(zone , Fiche.FicheStatus.DELETED));
        }
        return  fiches;
    }

    @Override
    public List<Fiche> getFichesSheetByIPDF(Long idIPDF) {
        User ipdf = userRepository.findById(idIPDF).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        if(ipdf.getRole().equals(Role.IPDF) || ipdf.getRole().equals(Role.SUPERUSER) ){
            return ficheRepository.findFicheByIPDFAndActionNot(ipdf , Fiche.FicheAction.DELETE );
        }
        throw new RuntimeException("L'utilisateur n'a pas le rôle IPDF requis.");
    }

    @Override
    public List<Fiche> getFichesSheetByIQP(Long idIQP) {
        User iqp = userRepository.findById(idIQP).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
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
            //fiches.addAll(ficheRepository.findByZoneAndStatus(u.getZone() , Fiche.FicheStatus.ACCEPTEDIQP));
        }
        return  fiches;
    }
    @Override
    public List<Fiche> getFichesSheetByAdmin(Long idAdmin) {
        User admin = userRepository.findById(idAdmin).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = admin.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for(UserZone u : zones){
            //fiches.addAll(ficheRepository.findByZone(u.getZone()));
        }
        return  fiches;
    }

}
