package com.pfe.backend.Repository;
import com.pfe.backend.Model.Operation;
import com.pfe.backend.Model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationRepository extends JpaRepository<Operation,Long> {
    Optional<Operation> findBynomAndIsDeleted(String nomOperation, boolean deleted);
    List<Operation> findByIsDeletedFalse();
}
