package com.pfe.backend.Controller;


import com.pfe.backend.Model.UserZone;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Service.ZoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RequestMapping("/zone")
@RestController
public class ZoneController {
    @Autowired
    private ZoneService zoneService;

    @GetMapping("/getAllZones")
    public ResponseEntity<List<Zone>> getAllZones(){
        return zoneService.getAllZones();
    }
    @GetMapping("/activeZones")
    public ResponseEntity<List<Zone>> getActiveZones() {
        return ResponseEntity.ok(zoneService.getActiveZones());
    }
    @PostMapping("addZone")
    public ResponseEntity<?> addZone(@RequestBody Zone zone,@RequestParam Long idActionneur)
    {
        return zoneService.addZone(zone,idActionneur);
    }
    @DeleteMapping("/delete/{idZone}")
    public ResponseEntity<?> DeleteZone(@PathVariable Long idZone, @RequestParam Long idActionneur) {
        try {
            zoneService.DeleteZone(idZone ,  idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/update/{idZone}")
    public ResponseEntity<?> updateZone(@PathVariable Long idZone, @RequestBody Zone updatedZone,@RequestParam Long idActionneur) {
        return zoneService.updateZone(idZone, updatedZone,idActionneur);
    }
    @GetMapping("/zone-users/{idZone}")
    public Set<UserZone> getZoneUsers(@PathVariable Long idZone) {
        return zoneService.getZoneUsers(idZone);
    }
}
