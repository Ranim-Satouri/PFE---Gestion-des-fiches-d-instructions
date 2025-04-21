package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheOperation;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FicheOperationRepository extends JpaRepository<FicheOperation,Long> {
    List<FicheOperation> findByOperationLigneZoneAndStatusNot(Zone zone , Fiche.FicheStatus status);

}
