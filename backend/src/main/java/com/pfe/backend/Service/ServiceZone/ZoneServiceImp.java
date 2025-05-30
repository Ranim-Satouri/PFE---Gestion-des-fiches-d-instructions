package com.pfe.backend.Service.ServiceZone;


import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.*;
import com.pfe.backend.Service.ServiceLigne.LigneService;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.AllArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.hibernate.envers.RevisionType;
import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class ZoneServiceImp implements ZoneService {
    @Autowired
    private ZoneRepository zoneRepo;
    private ZoneRepository zoneRepository;
    private UserRepository userRepo;
    private LigneRepository ligneRepo;
    private ProduitRepository produitRepo;
    private LigneService serviceLigne;
    private FicheZoneRepository ficheZoneRepo;
    @Override
    public ResponseEntity<List<Zone>> getAllZones() {
        return ResponseEntity.ok().body(zoneRepository.findAll());
    }
    @Override
    public List<Zone> getActiveZones() {
    return zoneRepository.findByIsDeletedFalse();
    }
    @Override
    public ResponseEntity<?> addZone(Zone zone, Long idActionneur) {
        User actionneur = userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Optional<Zone> existingZoneByNom = zoneRepository.findByNomAndIsDeleted(zone.getNom(), false);
        if (existingZoneByNom.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(null);
        }
        zone.setActionneur(actionneur);
        Zone savedZone = zoneRepository.save(zone);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedZone);
    }

    @Override
    public void DeleteZone(Long idZone , Long idActionneur) {
        Zone zone = zoneRepository.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        User actionneur = userRepo.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        zone.setDeleted(true);
        zone.getUserZones().clear();
        zone.getFamilles().clear();
        zone.setActionneur( actionneur);

        List<Ligne> lignes = ligneRepo.findByZoneAndIsDeletedFalse(zone);
        for (Ligne ligne : lignes) {
            serviceLigne.DeleteLigne(ligne.getIdLigne() , actionneur.getIdUser());
        }
        List<FicheZone> fichesZone = ficheZoneRepo.findByZoneAndStatusNot(zone , Fiche.FicheStatus.DELETED);
        for (Fiche fiche : fichesZone) {
            fiche.setStatus(Fiche.FicheStatus.DELETED);
            fiche.setAction(Fiche.FicheAction.DELETE);
            fiche.setActionneur(actionneur);
        }
        zoneRepository.save(zone);
    }

    @Override
    public ResponseEntity<?> updateZone(Long idZone, Zone newZoneData ,Long idActionneur)
    {
        Zone zone = zoneRepository.findById(idZone).orElseThrow(() -> new RuntimeException("Zone introuvable"));
        User actionneur = userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Optional<Zone> existingZoneByNom = zoneRepository.findByNomAndIsDeleted(newZoneData.getNom(), false);
        if (existingZoneByNom.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(null);
        }
        if(newZoneData.getNom()!=null ) zone.setNom(newZoneData.getNom());
        zone.setActionneur(actionneur);
        return ResponseEntity.status(HttpStatus.CREATED).body(zoneRepository.save(zone));
    }

    @Override
    public Set<UserZone> getZoneUsers(Long idZone) {
        Zone zone = zoneRepo.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        return zone.getUserZones();
    }

    @PersistenceContext
    private EntityManager entityManager;


    @Override
    public List<Zone> getZonesPourProduit(Long produitId) {
        Produit produit = produitRepo.findById(produitId).orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        Famille famille = produit.getFamille();
        List<Zone> zonesNonSupprimees = famille.getZones().stream()
                .filter(zone -> !zone.isDeleted())
                .collect(Collectors.toList());
        return zonesNonSupprimees;
    }


    @Override
    public List<Map<String, Object>> getZoneHistory(Long zoneId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Zone.class, false, true)
                .add(AuditEntity.id().eq(zoneId))
                .addOrder(AuditEntity.revisionNumber().desc())
                .getResultList();

        List<Map<String, Object>> history = new ArrayList<>();
        for (Object[] revision : revisions) {
            Zone zone = (Zone) revision[0]; // Entité Zone
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revision[1]; // Métadonnées de révision
            Integer revisionNumber = revisionEntity.getId(); // Numéro de révision
            RevisionType revisionType = (RevisionType) revision[2]; // Type de révision

            // Récupérer la date de la révision depuis revinfo
            LocalDateTime revisionDate = revisionEntity.getRevisionDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();

            // Déterminer le type de changement
            String changeType;
            switch (revisionType) {
                case ADD:
                    changeType = "CREATED";
                    break;
                case MOD:
                    changeType = "MODIFIED";
                    break;
                case DEL:
                    changeType = "DELETED";
                    break;
                default:
                    changeType = "UNKNOWN";
            }

            // Concaténer le nom et prénom de l'actionneur
            String actionneurFullName = zone.getActionneur() != null
                    ? zone.getActionneur().getNom() + " " + zone.getActionneur().getPrenom()
                    : "N/A";

            // Créer un objet JSON personnalisé avec les champs de Zone et les métadonnées
            Map<String, Object> historyEntry = new HashMap<>();
            historyEntry.put("revisionNumber", revisionNumber);
            historyEntry.put("revisionDate", revisionDate);
            historyEntry.put("changeType", changeType);
            historyEntry.put("idZone", zone.getIdZone());
            historyEntry.put("nom", zone.getNom());
            historyEntry.put("isDeleted", zone.isDeleted());
            historyEntry.put("modifieLe", zone.getModifieLe());
            historyEntry.put("actionneurFullName", actionneurFullName);

            history.add(historyEntry);
        }

        return history;
    }

}
