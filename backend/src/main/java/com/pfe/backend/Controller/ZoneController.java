package com.pfe.backend.Controller;


import com.pfe.backend.Repository.ZoneRepository;
import com.pfe.backend.Service.ZoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/zone")
@RestController
public class ZoneController {
    @Autowired
    private ZoneService zoneService;

}
