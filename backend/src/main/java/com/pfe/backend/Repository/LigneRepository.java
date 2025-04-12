package com.pfe.backend.Repository;

import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Model.Ligne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LigneRepository extends JpaRepository<Ligne,Long> {
    Optional<Ligne> findBynomAndIsDeleted(String nomLigne, boolean deleted);
    List<Ligne> findByIsDeletedFalse();
}
