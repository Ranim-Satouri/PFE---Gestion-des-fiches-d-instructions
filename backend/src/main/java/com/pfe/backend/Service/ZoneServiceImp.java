package com.pfe.backend.Service;


import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ZoneServiceImp implements ZoneService {
    @Autowired
    private ZoneRepository zoneRepository;
}
