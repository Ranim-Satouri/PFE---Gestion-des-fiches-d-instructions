package com.pfe.backend.Service.ServiceFamille;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.ZoneRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FamilleServiceImp implements FamilleService {
    @Autowired
    private FamilleRepository familleRepository;
    @Autowired
    private UserRepository userRepository;
    private ZoneRepository zoneRepository;

    @Override
    public ResponseEntity<?> addFamille(Famille famille, Long idActionneur) {
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        Optional<Famille> existingFamille = familleRepository.findByNomFamilleAndIsDeleted(famille.getNomFamille(), false);
        if (existingFamille.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Une famille avec le même nom existe déjà");
        }
        famille.setActionneur(actionneur);
        Famille savedFamille = familleRepository.save(famille);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedFamille);
    }

    @Override
    public ResponseEntity<List<Famille>> getFamilles() {
        return ResponseEntity.ok().body(familleRepository.findAll());
    }
    @Override
    public ResponseEntity<?> updateFamily(Long idFam, Famille NewfamilyData , Long idActionneur)
    {
        Famille famille = familleRepository.findById(idFam).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Famille> existingFamille = familleRepository.findByNomFamilleAndIsDeleted(NewfamilyData.getNomFamille(), false);
        if (existingFamille.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Une famille avec le même nom existe déjà");
        }
        if(NewfamilyData.getNomFamille()!=null ) famille.setNomFamille(NewfamilyData.getNomFamille());
        famille.setActionneur(actionneur);
        return ResponseEntity
                .status(HttpStatus.CREATED) // 201 Created, plus approprié ici
                .body(familleRepository.save(famille));
    }
    @Override
    public void DeleteFamily(Long idFam ,Long idActionneur)
    {
        Famille famille = familleRepository.findById(idFam).orElseThrow(()-> new RuntimeException("Famille introuvable !"));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        for (Produit produit : famille.getProduits()) {
            produit.setDeleted(true);
            produit.setActionneur(actionneur);
        }
        famille.getZones().clear();
        famille.setActionneur(actionneur);
        famille.setDeleted(true);
        familleRepository.save(famille);
    }
    @Override
    public List<Famille> getActiveFamilies() {
        return familleRepository.findByIsDeletedFalse();
    }
    public Famille addZonesToFamille(Long familleId, List<Long> zoneIds) {
        Famille famille = familleRepository.findById(familleId)
                .orElseThrow(() -> new RuntimeException("Famille non trouvé"));
        List<Zone> selectedZones = zoneRepository.findAllById(zoneIds);
        famille.setZones(selectedZones);
        famille.setZones(selectedZones);
        return familleRepository.save(famille);
    }
}
