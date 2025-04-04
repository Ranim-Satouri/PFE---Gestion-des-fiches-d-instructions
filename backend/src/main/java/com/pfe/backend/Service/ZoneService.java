package com.pfe.backend.Service;

import com.pfe.backend.Model.UserZone;
import com.pfe.backend.Model.Zone;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;

public interface ZoneService {
    ResponseEntity<List<Zone>> getAllZones();
    ResponseEntity<?> addZone(Zone zone,Long idActionneur);
    void updateZone(Long idZone, Zone newZoneData ,Long idActionneur);
    void DeleteZone(Long idZone , Long idActionneur);
    List<Zone> getActiveZones();
    Set<UserZone> getZoneUsers(Long idZone);

}
