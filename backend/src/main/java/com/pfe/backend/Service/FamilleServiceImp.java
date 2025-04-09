package com.pfe.backend.Service;
import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import com.pfe.backend.Repository.FamilleRepository;
import com.pfe.backend.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FamilleServiceImp implements FamilleService{
    @Autowired
    private FamilleRepository familleRepository;
    @Autowired
    private UserRepository userRepository;

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
        Famille famille = familleRepository.findById(idFam).orElseThrow(()-> new RuntimeException("Famille introuvable ! "));
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        for (Produit produit : famille.getProduits()) {
            produit.setDeleted(true);
            produit.setActionneur(actionneur);
        }
        famille.setActionneur(actionneur);
        famille.setDeleted(true);
        familleRepository.save(famille);

    }
    @Override
    public List<Famille> getActiveFamilies() {
        return familleRepository.findByIsDeletedFalse();
    }

}
