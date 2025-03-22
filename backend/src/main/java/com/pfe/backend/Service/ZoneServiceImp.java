package com.pfe.backend.Service;


import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ZoneServiceImp implements ZoneService {
    @Autowired
    private ZoneRepository zoneRepository;
    @Autowired
    private UserRepository userRepo;
    @Override
    public ResponseEntity<List<Zone>> getAllZones() {
        return ResponseEntity.ok().body(zoneRepository.findAll());
    }
    @Override
    public List<Zone> getActiveZones() {
    return zoneRepository.findByIsDeletedFalse();
    }
    @Override
    public ResponseEntity<Zone> addZone(Zone zone,Long idActionneur)
    {
        User actionneur = userRepo.findById(idActionneur)
            .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        zone.setActionneur(actionneur);
        Zone savedZone = zoneRepository.save(zone);
        return ResponseEntity.ok(savedZone);

    }
    @Override

    public void DeleteZone(Long idZone) {
        Zone zone = zoneRepository.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        zone.setDeleted(true);
        zone.getUserZones().clear();
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
}
