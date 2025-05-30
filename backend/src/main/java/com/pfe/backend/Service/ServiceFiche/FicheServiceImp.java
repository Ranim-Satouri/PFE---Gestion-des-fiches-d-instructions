package com.pfe.backend.Service.ServiceFiche;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.DTO.FicheDTO;
import com.pfe.backend.DTO.FicheAdvancedDTO;
import com.pfe.backend.DTO.FicheHistoryDTO;
import com.pfe.backend.DTO.FicheScoreDTO;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.*;
import com.pfe.backend.Service.ServiceMail.NotificationService;
import com.pfe.backend.configuration.EncryptionUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import javax.crypto.SecretKey;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.*;
import java.util.stream.Collectors;

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
    private UserZoneRepository userZoneRepository;
    private LigneRepository ligneRepository;
    private OperationRepository operationRepository;
    private NotificationService nService;
    private static final String STORAGE_DIR = Paths.get(System.getProperty("user.dir"))
            .getParent()
            .resolve("fiches")
            .toAbsolutePath()
            .toString();
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private GroupeRepository groupeRepository;


    @Override
    public List<Fiche> rechercheAvancee(String requete, Long idUser, List<String> situations) {
        User user = userRepository.findById(idUser).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        List<Fiche> fiches = new ArrayList<>();
        List<Permission> permissions = user.getGroupe().getPermissions();
        boolean hasPermission3 = permissions.stream()
                .anyMatch(p -> p.getIdPermission() == 3); // consulter_fiche_non_validées
        if(user.getGroupe().getNom().equals("SUPERUSER")){
            fiches = getFiches();
        }else{
            if(hasPermission3){
                fiches = getFichesSheetByUserZones(idUser);
            }else{
                fiches = getFichesSheetByOperateur(idUser);
            }
        }

        // Si des statuts sont sélectionnés, on filtre
        if (situations != null && !situations.isEmpty()) {
            fiches = fiches.stream()
                    .filter(f -> situations.contains(f.getStatus().name()))
                    .collect(Collectors.toList());
        }
        //Mapper en DTO
        List<FicheDTO> fichesDto = fiches.stream()
                .map(f -> new FicheDTO(f.getIdFiche(), f.getPdf()))
                .collect(Collectors.toList());

        // Construire le DTO à envoyer
        FicheAdvancedDTO ficheAdvancedDTO = new FicheAdvancedDTO();
        ficheAdvancedDTO.setText(requete);  // Le texte de recherche par ex.
        ficheAdvancedDTO.setFiches(fichesDto);

        // Préparer RestTemplate
        RestTemplate restTemplate = new RestTemplate();

        // Construire l'en-tête HTTP
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Construire la requête HTTP avec corps JSON
        HttpEntity<FicheAdvancedDTO> request = new HttpEntity<>(ficheAdvancedDTO, headers);

        String url = "http://127.0.0.1:5000/calculate-similarities";

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("ok");
                String jsonResponse = response.getBody();
                System.out.println(jsonResponse);
                ObjectMapper mapper = new ObjectMapper();
                List<FicheScoreDTO> ficheScores = mapper.readValue(jsonResponse, new TypeReference<List<FicheScoreDTO>>() {});

                // Pour chaque id reçu, récupère la fiche associée
                List<Fiche> fichesAvecScore = ficheScores.stream()
                        // Filtrer les scores strictement supérieurs à 0
                        .filter(fs -> fs.getScore() > 0)
                        // Récupérer la fiche associée en base
                        .map(fs -> {
                            Optional<Fiche> opt = ficheRepository.findById(fs.getId());
                            return opt.orElse(null);
                        })
                        // Supprimer les nulls (fiches non trouvées)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

                return fichesAvecScore;

            } else {
                System.out.println("erreur" + response.getStatusCode());
                throw new RuntimeException("Erreur API Flask : " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'appel API Flask", e);
        }
    }

    //historique
    public List<FicheHistoryDTO> getFicheHistory(Long ficheId) {
        // Créer un AuditReader pour interroger l'historique
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        // Récupérer toutes les révisions de la fiche avec l'ID donné
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Fiche.class, false, true)
                .add(AuditEntity.id().eq(ficheId)).addOrder(AuditEntity.revisionNumber().desc()).getResultList();

        List<FicheHistoryDTO> history = new ArrayList<>();

        // Mapper les résultats vers le DTO
        for (Object[] revision : revisions) {
            Fiche fiche = (Fiche) revision[0]; // L'entité audité
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revision[1]; // Métadonnées de révision
            String revisionType = revision[2].toString(); // Type de révision (ADD, MOD, DEL)

            FicheHistoryDTO dto = new FicheHistoryDTO();
            dto.setIdFiche(fiche.getIdFiche());
// Gestion des sous-classes pour récupérer Zone, Ligne, Operation
            if (fiche instanceof FicheZone) {
                FicheZone ficheZone = (FicheZone) fiche;
                dto.setIdZone(ficheZone.getZone() != null ? ficheZone.getZone().getIdZone() : null);
                dto.setZoneNom(ficheZone.getZone() != null ? ficheZone.getZone().getNom() : null);
            } else if (fiche instanceof FicheLigne) {
                FicheLigne ficheLigne = (FicheLigne) fiche;
                dto.setIdLigne(ficheLigne.getLigne() != null ? ficheLigne.getLigne().getIdLigne() : null);
                dto.setLigneNom(ficheLigne.getLigne() != null ? ficheLigne.getLigne().getNom() : null);
                // Récupérer la Zone associée à la Ligne
                if (ficheLigne.getLigne() != null && ficheLigne.getLigne().getZone() != null) {
                    dto.setIdZone(ficheLigne.getLigne().getZone().getIdZone());
                    dto.setZoneNom(ficheLigne.getLigne().getZone().getNom());
                }
            } else if (fiche instanceof FicheOperation) {
                FicheOperation ficheOperation = (FicheOperation) fiche;
                dto.setIdOperation(ficheOperation.getOperation() != null ? ficheOperation.getOperation().getIdOperation() : null);
                dto.setOperationNom(ficheOperation.getOperation() != null ? ficheOperation.getOperation().getNom() : null);
                // Récupérer la Ligne et la Zone associées à l'Operation
                if (ficheOperation.getOperation() != null && ficheOperation.getOperation().getLigne() != null) {
                    dto.setIdLigne(ficheOperation.getOperation().getLigne().getIdLigne());
                    dto.setLigneNom(ficheOperation.getOperation().getLigne().getNom());
                    // Récupérer la Zone associée à la Ligne
                    if (ficheOperation.getOperation().getLigne().getZone() != null) {
                        dto.setIdZone(ficheOperation.getOperation().getLigne().getZone().getIdZone());
                        dto.setZoneNom(ficheOperation.getOperation().getLigne().getZone().getNom());
                    }
                }
            }

            dto.setRevisionNumber(revisionEntity.getId());
            dto.setRevisionType(revisionType);
            dto.setStatus(fiche.getStatus() != null ? fiche.getStatus().toString() : null);
            dto.setCommentaire(fiche.getCommentaire());
            dto.setExpirationDate(fiche.getExpirationDate());
            dto.setPdf(fiche.getPdf());
            dto.setFicheAQL(fiche.getFicheAQL());
            dto.setAction(fiche.getAction() != null ? fiche.getAction().toString() : null);
            dto.setModifieLe(fiche.getModifieLe());
            dto.setTypeFiche(fiche.getTypeFiche());
            dto.setProduitNom(fiche.getProduit() != null ? fiche.getProduit().getNomProduit() : null);
            dto.setActionneurMatricule(fiche.getActionneur() != null ? fiche.getActionneur().getNom() + " " + fiche.getActionneur().getPrenom() : null);
            dto.setPreparateurMatricule(fiche.getPreparateur() != null ? fiche.getPreparateur().getNom() + " " + fiche.getPreparateur().getPrenom() : null);
            dto.setIpdfMatricule(fiche.getIPDF() != null ? fiche.getIPDF().getNom() + " " + fiche.getIPDF().getPrenom() : null);
            dto.setIqpMatricule(fiche.getIQP() != null ? fiche.getIQP().getNom() + " " + fiche.getIQP().getPrenom() : null);

            history.add(dto);
        }
        return history;
    }

    //update
    @Override
    public Fiche updateFicheZone(FicheZone ficheZone) {
        FicheZone existingFiche = (FicheZone) ficheRepository.findById(ficheZone.getIdFiche()).orElseThrow(() -> new RuntimeException("FicheZone introuvable"));
        User preparateur = userRepository.findById(ficheZone.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheZone.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheZone.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Zone zone = zoneRepository.findById(ficheZone.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
        existingFiche.setZone(zone);
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheZone.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);
        existingFiche.setCommentaire(ficheZone.getCommentaire());
        if(!existingFiche.getPdf().equals(ficheZone.getPdf())){
            existingFiche.setCommentaire("");
            existingFiche.setFicheAQL("");
            LocalDateTime currentDateTime = LocalDateTime.now();
            LocalDateTime expirationDate = currentDateTime.plusHours(24);
            existingFiche.setExpirationDate(expirationDate);
            existingFiche.setPdf(ficheZone.getPdf());
            //maaaaaaaiiiiillllllll
            addFicheMail(existingFiche , zone);
            // maaaaaaill done
        }
        return ficheRepository.save(existingFiche);
    }
    @Override
    public Fiche updateFicheLigne(FicheLigne ficheLigne) {
        FicheLigne existingFiche = (FicheLigne) ficheRepository.findById(ficheLigne.getIdFiche())
                .orElseThrow(() -> new RuntimeException("FicheLigne introuvable"));

        User preparateur = userRepository.findById(ficheLigne.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheLigne.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheLigne.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Ligne ligne = ligneRepository.findById(ficheLigne.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
        existingFiche.setLigne(ligne);
        existingFiche.setCommentaire(ficheLigne.getCommentaire());
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheLigne.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);
        System.out.println(ficheLigne.getPdf());
        if(!existingFiche.getPdf().equals(ficheLigne.getPdf())){
            existingFiche.setCommentaire("");
            existingFiche.setFicheAQL("");
            LocalDateTime currentDateTime = LocalDateTime.now();
            LocalDateTime expirationDate = currentDateTime.plusHours(24);
            existingFiche.setExpirationDate(expirationDate);
            existingFiche.setPdf(ficheLigne.getPdf());
            //maaaaaaaiiiiillllllll
            Zone zone = existingFiche.getLigne().getZone();
            addFicheMail(existingFiche , zone);
            // maaaaaaill done

        }
        return ficheRepository.save(existingFiche);
    }
    @Override
    public Fiche updateFicheOperation(FicheOperation ficheOperation) {
        FicheOperation existingFiche = (FicheOperation) ficheRepository.findById(ficheOperation.getIdFiche()).orElseThrow(() -> new RuntimeException("FicheOperation introuvable"));
        User preparateur = userRepository.findById(ficheOperation.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(ficheOperation.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(ficheOperation.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        existingFiche.setCommentaire(ficheOperation.getCommentaire());
        Operation operation = operationRepository.findById(ficheOperation.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
        existingFiche.setOperation(operation);
        existingFiche.setPreparateur(preparateur);
        existingFiche.setProduit(produit);
        existingFiche.setActionneur(actionneur);
        existingFiche.setStatus(ficheOperation.getStatus());
        existingFiche.setAction(Fiche.FicheAction.UPDATE);
        if(!existingFiche.getPdf().equals(ficheOperation.getPdf())){
            existingFiche.setCommentaire("");
            existingFiche.setFicheAQL("");
            LocalDateTime currentDateTime = LocalDateTime.now();
            LocalDateTime expirationDate = currentDateTime.plusHours(24);
            existingFiche.setExpirationDate(expirationDate);
            existingFiche.setPdf(ficheOperation.getPdf());
            //maaaaaaaiiiiillllllll
            Zone zone = existingFiche.getOperation().getLigne().getZone();
            addFicheMail(existingFiche , zone);
        }
        return ficheRepository.save(existingFiche);
    }

    //add
    @Override
    public FicheOperation addFicheOperation(FicheOperation fiche) {
        System.out.println(fiche.getOperation());
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Operation operation = operationRepository.findById(fiche.getOperation().getIdOperation()).orElseThrow(() -> new RuntimeException("Operation introuvable"));
        fiche.setOperation(operation);
        fiche.setTypeFiche("OPERATION");
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);

        FicheOperation insertedFiche = ficheOperationRepository.save(fiche);

        //maaaaaaaiiiiillllllll
        Zone zone = fiche.getOperation().getLigne().getZone();
        addFicheMail(insertedFiche , zone);
        // maaaaaaill done

        return insertedFiche;
    }
    @Override
    public FicheZone addFicheZone(FicheZone fiche) {
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        FicheZone ficheZone = (FicheZone) fiche;
        Zone zone = zoneRepository.findById(ficheZone.getZone().getIdZone()).orElseThrow(() -> new RuntimeException("Zone introuvable"));
        ficheZone.setZone(zone);
        fiche.setTypeFiche("ZONE");
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);

        FicheZone insertedFiche = ficheZoneRepository.save(fiche);
        //maaaaaaaiiiiillllllll
        addFicheMail(insertedFiche , zone);
        // maaaaaaill done

        return insertedFiche;
    }
    @Override
    public FicheLigne addFicheLigne(FicheLigne fiche) {
        User preparateur = userRepository.findById(fiche.getPreparateur().getIdUser()).orElseThrow(() -> new RuntimeException("Preparateur introuvable"));
        Produit produit = produitRepository.findById(fiche.getProduit().getIdProduit()).orElseThrow(() -> new RuntimeException("Produit introuvable"));
        User actionneur = userRepository.findById(fiche.getActionneur().getIdUser()).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Ligne ligne = ligneRepository.findById(fiche.getLigne().getIdLigne()).orElseThrow(() -> new RuntimeException("Ligne introuvable"));
        fiche.setLigne(ligne);
        fiche.setTypeFiche("LIGNE");
        fiche.setPreparateur(preparateur);
        fiche.setProduit(produit);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.INSERT);
        fiche.setStatus(Fiche.FicheStatus.PENDING);
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expirationDate = currentDateTime.plusHours(24);
        fiche.setExpirationDate(expirationDate);

        FicheLigne insertedFiche = ficheLigneRepository.save(fiche);
        //maaaaaaaiiiiillllllll
        Zone zone = fiche.getLigne().getZone();
        addFicheMail(insertedFiche , zone);
        // maaaaaaill done

        return insertedFiche;
    }


    //validation
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
        fiche.setIPDF(actionneur);

        // maaaaaaiiiiiilll
        validationIPDFMail(fiche);

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
        fiche.setIQP(actionneur);

        //maaaaaaaiiiiillllllll
        validationIqpMail(fiche);
        // maaaaaaill done

        return ficheRepository.save(fiche);
    }

    //get
    @Override
    public List<Fiche> getFiches() {
        return ficheRepository.findByStatusNot(Fiche.FicheStatus.DELETED);
    }

    @Override
    public List<Fiche> getFichesSheetByUserZones(Long idUser) {
        User user = userRepository.findById(idUser).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = user.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for (UserZone u : zones) {
            Zone zone = u.getZone();
            fiches.addAll(ficheZoneRepository.findByZoneAndStatusNot(zone, Fiche.FicheStatus.DELETED));
            fiches.addAll(ficheLigneRepository.findByLigneZoneAndStatusNot(zone, Fiche.FicheStatus.DELETED));
            fiches.addAll(ficheOperationRepository.findByOperationLigneZoneAndStatusNot(zone , Fiche.FicheStatus.DELETED));
        }
        return  fiches;
    }

    @Override
    public List<Fiche> getFichesSheetByOperateur(Long idOperateur) {
        User operateur = userRepository.findById(idOperateur).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = operateur.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        for (UserZone u : zones) {
            Zone zone = u.getZone();

            fiches.addAll(ficheZoneRepository.findByZoneAndStatus(zone, Fiche.FicheStatus.ACCEPTEDIQP));
            fiches.addAll(ficheLigneRepository.findByLigneZoneAndStatus(zone, Fiche.FicheStatus.ACCEPTEDIQP));
            fiches.addAll(ficheOperationRepository.findByOperationLigneZoneAndStatus(zone , Fiche.FicheStatus.ACCEPTEDIQP));
        }
        return  fiches;
    }
    @Override
    public List<Fiche> getFichesSheetByAdmin(Long idAdmin) {
        User admin = userRepository.findById(idAdmin).orElseThrow(() -> new RuntimeException("utilisateur introuvable"));
        Set<UserZone> zones = admin.getUserZones();
        List<Fiche> fiches = new ArrayList<>();
        return  fiches;
    }

    //delete
    @Override
    public Fiche deleteFiche(long idFiche, long idSupprimateur) {
        Fiche fiche = ficheRepository.findById(idFiche).orElseThrow(() -> new RuntimeException("fiche introuvable"));
        User actionneur = userRepository.findById(idSupprimateur).orElseThrow(() -> new RuntimeException("actionneur introuvable"));

        fiche.setStatus(Fiche.FicheStatus.DELETED);
        fiche.setActionneur(actionneur);
        fiche.setAction(Fiche.FicheAction.DELETE);
        return ficheRepository.save(fiche);
    }

    //expiration
    @Override
    public boolean verifierEtMettreAJourFichesExpirees() {
        List<Fiche.FicheStatus> etatsAExclure = Arrays.asList(Fiche.FicheStatus.EXPIRED, Fiche.FicheStatus.ACCEPTEDIQP , Fiche.FicheStatus.DELETED);
        List<Fiche> fichesExpirees = ficheRepository.findFichesNonFinalesEtExpirees(etatsAExclure,LocalDateTime.now());
        boolean updated = false;
        if(!fichesExpirees.isEmpty()){
            for (Fiche fiche : fichesExpirees) {
                fiche.setStatus(Fiche.FicheStatus.EXPIRED);
                fiche.setAction(Fiche.FicheAction.EXPIRE);
                ficheRepository.save(fiche);
                FicheExpirationMail(fiche);
            }
            updated = true;
        }
        return updated;
    }

    @Transactional
    @Scheduled(fixedRate = 4 * 60 * 60 * 1000)
    public void sendExpirationReminder() {
        List<Fiche> fiches = ficheRepository.findByStatusNot(Fiche.FicheStatus.DELETED);
        System.out.println("test  5 min");
        for (Fiche fiche : fiches) {
            if (fiche.getStatus().equals(Fiche.FicheStatus.ACCEPTEDIPDF) || fiche.getStatus().equals(Fiche.FicheStatus.PENDING)) {

                LocalDateTime currentTime = LocalDateTime.now();
                LocalDateTime expirationDate = fiche.getExpirationDate();

                long hoursUntilExpiration = ChronoUnit.HOURS.between(currentTime, expirationDate);

                // Si la fiche doit être validée dans les prochaines 24 heures, envoyer un rappel
                if (hoursUntilExpiration <= 24 && hoursUntilExpiration > 0) {
                    reminderMail(fiche , hoursUntilExpiration);
                }
            }
        }
    }

    // pdf
    @Override
    public String saveFile(MultipartFile file) throws Exception {
        System.out.println(STORAGE_DIR);
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        File uploadDir = new File(STORAGE_DIR); //tjib el dossier
        if (!uploadDir.exists()) uploadDir.mkdirs(); // Créer le dossier s'il n'existe pas

        // Générer un nom unique
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        //String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename(); // autre facon

        // Charger ou générer la clé de chiffrement unique
        //SecretKey secretKey = EncryptionUtils.loadOrGenerateEncryptionKey();

        // Crypter les données du fichier
        //byte[] encryptedData = EncryptionUtils.encrypt(file.getBytes(), secretKey);

        // Définir le chemin complet bech taamel bih write
        Path destinationPath = Paths.get(STORAGE_DIR).resolve(fileName);

        // Sauvegarder le fichier chiffré
        //Files.write(destinationPath, encryptedData);
        Files.write(destinationPath, file.getBytes());

        return fileName; // Retourne juste le nom du fichier
    }

    @Override
    public Resource loadPdf(String filename) {
        try {
            // générer la clé de chiffrement unique (ken ma fammech bech yasna3 wehed)
            //SecretKey secretKey = EncryptionUtils.loadOrGenerateEncryptionKey();

            // Charger le fichier chiffré bel esm te3ou
            Path filePath = Paths.get(STORAGE_DIR).resolve(filename); //ijib el dossier
            byte[] encryptedData = Files.readAllBytes(filePath); // ijib el file

            // Déchiffrer le fichier
            //byte[] decryptedData = EncryptionUtils.decrypt(encryptedData, secretKey);

            // Retourner le fichier sous forme de ByteArrayResource
//            return new ByteArrayResource(decryptedData);
            return new ByteArrayResource(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du chargement du fichier PDF : " + filename, e);
        }
    }


    //mails
    public void addFicheMail(Fiche fiche, Zone zone){
        List<UserZone> usersToNotify = userZoneRepository.findByZone(zone);
        List<User> usersWithPermission = new ArrayList<>();

        for (UserZone userZone : usersToNotify) {
            Groupe userGroup = userZone.getUser().getGroupe();
            boolean hasPermission = userGroup.getPermissions().stream()
                    .anyMatch(permission -> permission.getNom().equals("valider_fiche_IPDF"));
            if (hasPermission && !userZone.getUser().getGroupe().getNom().equals("ADMIN") && !userZone.getUser().getGroupe().getNom().equals("SUPERUSER")) {
                usersWithPermission.add(userZone.getUser());
            }
        }
        for (User user : usersWithPermission) {
            nService.notifyIPDFAboutFicheInjection(fiche, user);
        }

//        Groupe superuser = groupeRepository.findByNom("SUPERUSER");
//        List<User> superUsers =userRepository.findByGroupe(superuser);
//        for(User u : superUsers){
//            nService.notifySuperUserAboutNewFiche(fiche, u);
//        }
//
//        Groupe admin = groupeRepository.findByNom("ADMIN");
//        List<User> admins = userRepository.findByGroupeAndUserZones_Zone(admin , zone);
//        for(User u : admins){
//            nService.notifySuperUserAboutNewFiche(fiche, u);
//        }
        // maaaaaaill done
    }
    public void validationIPDFMail(Fiche fiche ){
        Zone zone = null;
        if(fiche.getTypeFiche().equals("OPERATION")){
            FicheOperation ficheOperation = (FicheOperation) fiche;
            zone = ficheOperation.getOperation().getLigne().getZone();
        }else if(fiche.getTypeFiche().equals("LIGNE")){
            FicheLigne ficheLigne = (FicheLigne) fiche;
            zone = ficheLigne.getLigne().getZone();
        }else{
            FicheZone ficheZone = (FicheZone) fiche;
            zone = ficheZone.getZone();
        }
//        Groupe superuser = groupeRepository.findByNom("SUPERUSER");
//        List<User> superUsers=userRepository.findByGroupe(superuser);
//        Groupe admin = groupeRepository.findByNom("ADMIN");
//        List<User> admins = userRepository.findByGroupeAndUserZones_Zone(admin , zone);

        if(fiche.getStatus().equals(Fiche.FicheStatus.ACCEPTEDIPDF)){
            nService.notifyPreparateurAboutIPDFAcceptance(fiche);
//            for(User u : superUsers){
//                nService.notifySuperUserAboutIPDFAcceptence(fiche, u);
//            }
//            for(User u : admins){
//                nService.notifySuperUserAboutIPDFAcceptence(fiche, u);
//            }
            List<UserZone> usersToNotify = userZoneRepository.findByZone(zone);
            List<User> usersWithPermission = new ArrayList<>();

            for (UserZone userZone : usersToNotify) {
                Groupe userGroup = userZone.getUser().getGroupe();
                boolean hasPermission = userGroup.getPermissions().stream()
                        .anyMatch(permission -> permission.getNom().equals("valider_fiche_IQP"));
                if (hasPermission && !userZone.getUser().getGroupe().getNom().equals("ADMIN") && !userZone.getUser().getGroupe().getNom().equals("SUPERUSER")) {
                    usersWithPermission.add(userZone.getUser());
                }
            }
            for (User user : usersWithPermission) {
                nService.notifyIQPAboutFicheValidationByIPDF(fiche , user);
            }

        }else{
            nService.notifyPreparateurAboutIPDFRejection(fiche);
//            for(User u : superUsers){
//                nService.notifySuperUserAboutIPDFRejection(fiche, u);
//            }
//            for(User u : admins){
//                nService.notifySuperUserAboutIPDFRejection(fiche, u);
//            }
        }

    }
    public void validationIqpMail(Fiche fiche){
        Zone zone = null;
        if(fiche.getTypeFiche().equals("OPERATION")){
            FicheOperation ficheOperation = (FicheOperation) fiche;
            zone = ficheOperation.getOperation().getLigne().getZone();
        }else if(fiche.getTypeFiche().equals("LIGNE")){
            FicheLigne ficheLigne = (FicheLigne) fiche;
            zone = ficheLigne.getLigne().getZone();
        }else{
            FicheZone ficheZone = (FicheZone) fiche;
            zone = ficheZone.getZone();
        }
//        Groupe superuser = groupeRepository.findByNom("SUPERUSER");
//        List<User> superUsers=userRepository.findByGroupe(superuser);
//        Groupe admin = groupeRepository.findByNom("ADMIN");
//        List<User> admins = userRepository.findByGroupeAndUserZones_Zone(admin , zone);

        if(fiche.getStatus().equals(Fiche.FicheStatus.ACCEPTEDIQP)){
            nService.notifyPreparateurAboutIQPAcceptance(fiche);
//            for(User u : superUsers){
//                nService.notifySuperUserAboutIQPValidation(fiche , u);
//            }
//            for(User u : admins){
//                nService.notifySuperUserAboutIQPValidation(fiche, u);
//            }
        }else{
            nService.notifyPreparateurAboutIQPRejection(fiche);
//            for(User u : superUsers){
//                nService.notifySuperUserAboutIQPRejection(fiche, u);
//            }
//            for(User u : admins){
//                nService.notifySuperUserAboutIQPRejection(fiche, u);
//            }
        }

    }
    public void reminderMail(Fiche fiche , long hoursUntilExpiration){
        Zone zone = null;
        if(fiche.getTypeFiche().equals("OPERATION")){
            FicheOperation ficheOperation = (FicheOperation) fiche;
            zone = ficheOperation.getOperation().getLigne().getZone();
        }else if(fiche.getTypeFiche().equals("LIGNE")){
            FicheLigne ficheLigne = (FicheLigne) fiche;
            zone = ficheLigne.getLigne().getZone();
        }else{
            FicheZone ficheZone = (FicheZone) fiche;
            zone = ficheZone.getZone();
        }
//        Groupe superuser = groupeRepository.findByNom("SUPERUSER");
//        List<User> superUsers=userRepository.findByGroupe(superuser);
//        Groupe admin = groupeRepository.findByNom("ADMIN");
//        List<User> admins = userRepository.findByGroupeAndUserZones_Zone(admin , zone);

        if(fiche.getStatus().equals(Fiche.FicheStatus.PENDING)){
            List<UserZone> usersToNotify = userZoneRepository.findByZone(zone);
            List<User> usersWithPermission = new ArrayList<>();

            for (UserZone userZone : usersToNotify) {
                Groupe userGroup = userZone.getUser().getGroupe();
                boolean hasPermission = userGroup.getPermissions().stream()
                        .anyMatch(permission -> permission.getNom().equals("valider_fiche_IPDF"));
                if (hasPermission && !userZone.getUser().getGroupe().getNom().equals("ADMIN") && !userZone.getUser().getGroupe().getNom().equals("SUPERUSER")) {
                    usersWithPermission.add(userZone.getUser());
                }
            }
            for (User user : usersWithPermission) {
                nService.sendExpirationReminderForFiche(fiche, hoursUntilExpiration , user);
            }
        }else{
            List<UserZone> usersToNotify = userZoneRepository.findByZone(zone);
            List<User> usersWithPermission = new ArrayList<>();

            for (UserZone userZone : usersToNotify) {
                Groupe userGroup = userZone.getUser().getGroupe();
                boolean hasPermission = userGroup.getPermissions().stream()
                        .anyMatch(permission -> permission.getNom().equals("valider_fiche_IQP"));
                if (hasPermission && !userZone.getUser().getGroupe().getNom().equals("ADMIN") && !userZone.getUser().getGroupe().getNom().equals("SUPERUSER")) {
                    usersWithPermission.add(userZone.getUser());
                }
            }
            for (User user : usersWithPermission) {
                nService.sendExpirationReminderForFiche(fiche, hoursUntilExpiration , user);
            }
        }
//        for(User u : superUsers){
//            nService.sendExpirationReminderForFiche(fiche, hoursUntilExpiration , u);
//        }
//
//        for(User u : admins){
//            nService.sendExpirationReminderForFiche(fiche, hoursUntilExpiration , u);
//        }
    }
    public void FicheExpirationMail(Fiche fiche){

        Groupe superuser = groupeRepository.findByNom("SUPERUSER");
        List<User> superUsers=userRepository.findByGroupe(superuser);

        for(User u : superUsers){
            nService.notifySuperUserAboutFicheExpiration(fiche, u);
        }
    }

}
