package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FicheRepository extends JpaRepository<Fiche,Long> {
    List<Fiche> findFicheByPreparateurAndActionNot(User preparateur , Fiche.FicheAction action);
    List<Fiche> findFicheByIPDFAndActionNot(User IPDF , Fiche.FicheAction action);
    List<Fiche> findFicheByIQPAndActionNot(User IQP , Fiche.FicheAction action);
    List<Fiche> findByActionNot(Fiche.FicheAction status);
}
