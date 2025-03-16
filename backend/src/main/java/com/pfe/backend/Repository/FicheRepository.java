package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FicheRepository extends JpaRepository<Fiche,Long> {
    List<Fiche> findFicheByPreparateur(User preparateur);
    List<Fiche> findFicheByIPDF(User IPDF);
    List<Fiche> findFicheByIQP(User IQP);
}
