package com.pfe.backend.Repository;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Fiche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilleRepository extends JpaRepository<Famille,Long> {
    List<Famille> findByIsDeletedFalse();
    Optional<Famille> findByNomFamilleAndIsDeleted(String nomFamille , boolean deleted);
}
