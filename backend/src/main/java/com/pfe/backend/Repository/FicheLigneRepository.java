package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheLigne;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FicheLigneRepository extends JpaRepository<FicheLigne,Long> {
    List<FicheLigne> findByLigneZoneAndStatusNot(Zone zone , Fiche.FicheStatus status);
}
