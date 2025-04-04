package com.pfe.backend.Service;


import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FicheRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class ZoneServiceImp implements ZoneService {
    @Autowired
    private ZoneRepository zoneRepo;
    private ZoneRepository zoneRepository;
    private UserRepository userRepo;
    private FicheRepository ficheRepo;
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
        Optional<User> actionneurOpt = userRepo.findById(idActionneur);
        if (actionneurOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Actionneur introuvable");
        }

        Optional<Zone> existingZoneByNom = zoneRepository.findByNomAndIsDeleted(zone.getNom(), false);
        if (existingZoneByNom.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Une Zone avec le même nom existe déjà");
        }

        zone.setActionneur(actionneurOpt.get());
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
        zone.setActionneur( actionneur);
        List<Fiche> fiches = ficheRepo.findByZone(zone);
        for (Fiche fiche : fiches) {
            fiche.setStatus(Fiche.FicheStatus.DELETED);
            fiche.setAction(Fiche.FicheAction.DELETE);
            fiche.setActionneur(actionneur);
        }
        ficheRepo.saveAll(fiches);
        zoneRepository.save(zone);
    }
    @Override
    public void updateZone(Long idZone, Zone newZoneData ,Long idActionneur)
    {
        Zone zone = zoneRepository.findById(idZone).orElseThrow(()-> new RuntimeException("zone introuvable ! "));
        User actionneur = userRepo.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        if (zone.isDeleted()) {
            throw new RuntimeException("Impossible de mettre à jour une zone supprimée.");
        }
        if(newZoneData.getNom()!=null ) zone.setNom(newZoneData.getNom());
        zone.setActionneur(actionneur);
        zoneRepository.save(zone);
    }
    @Override
    public Set<UserZone> getZoneUsers(Long idZone) {
        Zone zone = zoneRepo.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        return zone.getUserZones();
    }
}
