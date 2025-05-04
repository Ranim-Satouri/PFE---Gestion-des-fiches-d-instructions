package com.pfe.backend.Service.ServiceFamille;

import com.pfe.backend.Model.Famille;
import com.pfe.backend.DTO.FamilleHistoriqueDTO;
import com.pfe.backend.DTO.FamilleZonesDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FamilleService {
    ResponseEntity<?> addFamille(Famille famille, Long idActionneur);
    ResponseEntity<List<Famille>> getFamilles();
    ResponseEntity<?> updateFamily(Long idFam, Famille newFamillyData ,Long idActionneur);
    void DeleteFamily(Long idFam , Long idActionneur);
    List<Famille> getActiveFamilies();
    Famille addZonesToFamille(Long familleId, List<Long> zoneIds);
    List<FamilleHistoriqueDTO> getFamilleHistory(Long familleId);
    List<FamilleZonesDTO> getFamilleZonesAudit(Long familleId);
    List<Famille> getFamillesByUserZones(Long idUser);
}
