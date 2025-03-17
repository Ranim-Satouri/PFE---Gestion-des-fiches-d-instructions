package com.pfe.backend.Service;


import com.pfe.backend.Model.Zone;
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

    @Override
    public ResponseEntity<List<Zone>> getAllZones() {
        return ResponseEntity.ok().body(zoneRepository.findAll());
    }

    @Override
    public ResponseEntity<Zone> addZone(Zone zone) {
        return ResponseEntity.ok().body(zoneRepository.save(zone));
    }
}
