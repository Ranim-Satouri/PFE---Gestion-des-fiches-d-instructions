package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheZone;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FicheZoneRepository extends JpaRepository<FicheZone,Long> {
    List<FicheZone> findByZoneAndStatusNot(Zone zone , Fiche.FicheStatus status);
}
