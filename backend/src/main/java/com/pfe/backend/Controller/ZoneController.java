package com.pfe.backend.Controller;


import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.ZoneRepository;
import com.pfe.backend.Service.ZoneService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("addZone")
    public ResponseEntity<Zone> addZone(@RequestBody Zone zone){
        return zoneService.addZone(zone);
    }

}
