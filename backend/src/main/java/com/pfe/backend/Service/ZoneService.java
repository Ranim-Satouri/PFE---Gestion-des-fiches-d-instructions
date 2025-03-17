package com.pfe.backend.Service;

import com.pfe.backend.Model.Zone;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ZoneService {
    ResponseEntity<List<Zone>> getAllZones();
    ResponseEntity<Zone> addZone(Zone zone);
}
