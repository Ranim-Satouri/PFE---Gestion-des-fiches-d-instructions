package com.pfe.backend.Repository;
import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Model.Operation;
import com.pfe.backend.Model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationRepository extends JpaRepository<Operation,Long> {
    Optional<Operation> findBynomAndIsDeletedAndLigne(String nomOperation, boolean deleted , Ligne ligne);
    List<Operation> findByIsDeletedFalse();
    List<Operation> findByLigneAndIsDeletedFalse(Ligne ligne);
}
