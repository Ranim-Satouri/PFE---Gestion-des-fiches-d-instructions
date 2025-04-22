package com.pfe.backend.Service.ServiceFamille;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.AllArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FamilleServiceImp implements FamilleService {
    @Autowired
    private FamilleRepository familleRepository;
    @Autowired
    private UserRepository userRepository;
    private ZoneRepository zoneRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public List<FamilleHistory> getFamilleHistory(Long familleId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Famille.class, false, true)
                .add(AuditEntity.id().eq(familleId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<FamilleHistory> history = new ArrayList<>();
        for (Object[] revision : revisions) {
            Famille famille = (Famille) revision[0];
            Integer revisionNumber = (Integer) revision[1];
            String revisionType = revision[2].toString();

            FamilleHistory dto = new FamilleHistory();
            dto.setRevisionNumber(revisionNumber);
            dto.setModifieLe(famille.getModifieLe());
            dto.setActionneurFullName(famille.getActionneur().getNom() + " " + famille.getActionneur().getPrenom());
            dto.setNom(famille.getNomFamille());
            dto.setDeleted(famille.isDeleted());
            // Récupérer les zones associées à cette révision
            List<Zone> zonesAtRevision = auditReader.find(Famille.class, familleId, revisionNumber).getZones();
            dto.setZones(zonesAtRevision.stream().map(Zone::getNom).collect(Collectors.toList()));
            history.add(dto);
        }

        return history;
    }

    public List<FamilleZonesAudit> getFamilleZonesAudit(Long familleId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Famille.class, false, true)
                .add(AuditEntity.id().eq(familleId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<FamilleZonesAudit> auditEntries = new ArrayList<>();
        for (Object[] revision : revisions) {
            Integer revisionNumber = (Integer) revision[1];
            Famille familleAtRevision = auditReader.find(Famille.class, familleId, revisionNumber);
            String revisionType = revision[2].toString(); // ADD, MOD, DEL

            // Récupérer les zones à cette révision
            List<Zone> zones = familleAtRevision.getZones();
            FamilleZonesAudit auditDTO = new FamilleZonesAudit();
            auditDTO.setRevisionNumber(revisionNumber);
            auditDTO.setModifieLe(familleAtRevision.getModifieLe());
            auditDTO.setActionneurFullName(familleAtRevision.getActionneur().getNom() + " " + familleAtRevision.getActionneur().getPrenom());
            auditDTO.setRevisionType(revisionType);
            auditDTO.setZones(zones.stream().map(Zone::getNom).collect(Collectors.toList()));
            auditEntries.add(auditDTO);
        }

        return auditEntries;
    }
    @Override
    public ResponseEntity<?> addFamille(Famille famille, Long idActionneur) {
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Optional<Famille> existingFamille = familleRepository.findByNomFamilleAndIsDeleted(famille.getNomFamille(), false);
        if (existingFamille.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Une famille avec le même nom existe déjà");
        }
        famille.setActionneur(actionneur);
        Famille savedFamille = familleRepository.save(famille);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedFamille);
    }

    @Override
    public ResponseEntity<List<Famille>> getFamilles() {
        return ResponseEntity.ok().body(familleRepository.findAll());
    }
    @Override
    public ResponseEntity<?> updateFamily(Long idFam, Famille NewfamilyData , Long idActionneur)
    {
        Famille famille = familleRepository.findById(idFam).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Famille> existingFamille = familleRepository.findByNomFamilleAndIsDeleted(NewfamilyData.getNomFamille(), false);
        if (existingFamille.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Une famille avec le même nom existe déjà");
        }
        if(NewfamilyData.getNomFamille()!=null ) famille.setNomFamille(NewfamilyData.getNomFamille());
        famille.setActionneur(actionneur);
        return ResponseEntity
                .status(HttpStatus.CREATED) // 201 Created, plus approprié ici
                .body(familleRepository.save(famille));
    }
    @Override
    public void DeleteFamily(Long idFam ,Long idActionneur)
    {
        Famille famille = familleRepository.findById(idFam).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        for (Produit produit : famille.getProduits()) {
            produit.setDeleted(true);
            produit.setActionneur(actionneur);
        }
        famille.getZones().clear();
        famille.setActionneur(actionneur);
        famille.setDeleted(true);
        familleRepository.save(famille);

    }
    @Override
    public List<Famille> getActiveFamilies() {
        return familleRepository.findByIsDeletedFalse();
    }
    public Famille addZonesToFamille(Long familleId, List<Long> zoneIds) {
        Famille famille = familleRepository.findById(familleId)
                .orElseThrow(() -> new RuntimeException("Famille non trouvé"));
        List<Zone> selectedZones = zoneRepository.findAllById(zoneIds);
        famille.setZones(selectedZones);
        famille.setZones(selectedZones);
        return familleRepository.save(famille);
    }
}
