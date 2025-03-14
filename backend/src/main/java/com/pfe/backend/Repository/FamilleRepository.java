package com.pfe.backend.Repository;


import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.Fiche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilleRepository extends JpaRepository<Famille,Long> {
}
