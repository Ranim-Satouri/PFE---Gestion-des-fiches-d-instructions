package com.pfe.backend.Controller;


import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.ZoneRepository;
import com.pfe.backend.Service.ZoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Zone> addZone(@RequestBody Zone zone,@RequestParam Long idActionneur)
    {
        return zoneService.addZone(zone,idActionneur);

    }
    @DeleteMapping("/delete/{idZone}")
    public ResponseEntity<?> DeleteZone(@PathVariable Long idZone) {
        try {
            zoneService.DeleteZone(idZone);
            return ResponseEntity.ok("Zone supprimée avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/update/{idZone}")
    public ResponseEntity<?> updateZone(@PathVariable Long idZone, @RequestBody Zone updatedZone,@RequestParam Long idActionneur) {
        zoneService.updateZone(idZone, updatedZone,idActionneur);
        return ResponseEntity.ok("Zone mis à jour !");
    }

}
