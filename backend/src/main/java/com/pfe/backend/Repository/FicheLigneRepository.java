package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheLigne;
import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface FicheLigneRepository extends JpaRepository<FicheLigne,Long> {
    List<FicheLigne> findByLigneZoneAndStatusNot(Zone zone , Fiche.FicheStatus status);
    List<FicheLigne> findByLigneAndStatusNot(Ligne ligne , Fiche.FicheStatus status);

}
