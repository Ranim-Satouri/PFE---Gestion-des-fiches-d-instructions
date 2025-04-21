package com.pfe.backend.Repository;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Produit;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FicheRepository extends JpaRepository<Fiche,Long> {
    List<Fiche> findFicheByPreparateurAndActionNot(User preparateur , Fiche.FicheAction action);
    List<Fiche> findFicheByIPDFAndActionNot(User IPDF , Fiche.FicheAction action);
    List<Fiche> findFicheByIQPAndActionNotAndStatusNot(User IQP , Fiche.FicheAction action , Fiche.FicheStatus status);
    List<Fiche> findByStatusNot(Fiche.FicheStatus status);
    List<Fiche> findByProduit(Produit produit);
    List<Fiche> findByStatusNotAndExpirationDateBefore(Fiche.FicheStatus status ,LocalDateTime expirationDate);

}
