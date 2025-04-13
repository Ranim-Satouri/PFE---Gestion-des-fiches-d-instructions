package com.pfe.backend.Repository;
import com.pfe.backend.Model.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe,Long> {
    Optional<Groupe> findBynomAndIsDeleted(String nomGroupe, boolean deleted);
    List<Groupe> findByIsDeletedFalse();
    Groupe findByNom(String nom);

}
