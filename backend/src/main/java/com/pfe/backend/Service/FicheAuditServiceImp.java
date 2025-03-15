package com.pfe.backend.Service;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheHistoryDto;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class FicheAuditServiceImp implements FicheAuditService{
    @Autowired
    private EntityManager entityManager;

    public List<FicheHistoryDto> getFicheHistory(Long ficheId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        System.out.println("mazelna besmelleh");
        // Récupérer toutes les révisions pour l'entité Fiche
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Fiche.class, false, true)
                .add(AuditEntity.id().eq(ficheId))
                .getResultList();
        System.out.println("wsolan hneee");
        // Mapper les résultats vers une liste de DTOs
        List<FicheHistoryDto> history = new ArrayList<>();
        ;
        for (Object[] revision : revisions) {
            Fiche fiche = (Fiche) revision[0]; // Entité modifiée
            System.out.println("wsolan hneee zeda");
            //CustomRevisionEntity revEntity = (CustomRevisionEntity) revision[1]; // Informations de révision
            DefaultRevisionEntity revEntity = (DefaultRevisionEntity) revision[1]; // Informations de révision par défaut
            RevisionType revType = (RevisionType) revision[2];
            FicheHistoryDto f = new FicheHistoryDto(
                    revEntity.getId(),
                    revEntity.getTimestamp(),
                    getRevisionType(revType),
                    fiche);
            System.out.println(fiche);
            history.add(f);

        }
        System.out.println("wsolan hneee zeda x2");
        System.out.println(history);
        System.out.println("wsolan hneee zeda x3");
        return history;
    }

    private String getRevisionType(RevisionType revType) {
        switch (revType) {
            case ADD:
                return "INSERT";
            case MOD:
                return  "UPDATE";

            case DEL:
                return "DELETE";

            default:
                return "UNKNOWN";
    }
}

        }