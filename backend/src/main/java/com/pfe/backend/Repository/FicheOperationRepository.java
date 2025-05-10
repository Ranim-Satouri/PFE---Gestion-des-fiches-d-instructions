package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheOperation;
import com.pfe.backend.Model.Operation;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface FicheOperationRepository extends JpaRepository<FicheOperation,Long> {
    List<FicheOperation> findByOperationLigneZoneAndStatusNot(Zone zone , Fiche.FicheStatus status);
    List<FicheOperation> findByOperationLigneZoneAndStatus(Zone zone , Fiche.FicheStatus status);
    List<FicheOperation> findByOperationAndStatusNot(Operation operation , Fiche.FicheStatus status);
}
