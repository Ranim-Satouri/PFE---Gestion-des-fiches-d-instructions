package com.pfe.backend.Repository;

import com.pfe.backend.Model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByIsDeletedFalse();
    Optional<Zone> findByNomAndIsDeleted(String nomZone , boolean deleted);
}
