package com.pfe.backend.Service;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.FicheHistoryDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.AllArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class FicheAuditServiceImp implements FicheAuditService{
    @PersistenceContext
    private EntityManager entityManager;

    public List<FicheHistoryDto> getFicheHistory(Long ficheId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        // Récupérer toutes les révisions pour l'entité Fiche
        List<Object[]> revisions = auditReader.createQuery()
                .forRevisionsOfEntity(Fiche.class, false, true)
                .add(AuditEntity.id().eq(ficheId))
                .getResultList();

        // Mapper les résultats vers une liste de DTOs
        List<FicheHistoryDto> history = new ArrayList<>();
        ;
        for (Object[] revision : revisions) {
            Fiche fiche = (Fiche) revision[0]; // Entité modifiée
            DefaultRevisionEntity revEntity = (DefaultRevisionEntity) revision[1]; // Informations de révision par défaut
            RevisionType revType = (RevisionType) revision[2];
            FicheHistoryDto f = new FicheHistoryDto(
                    revEntity.getId(),
                    revEntity.getTimestamp(),
                    getRevisionType(revType),
                    fiche);
            history.add(f);
        }
        return history;
    }

    private String getRevisionType(RevisionType revType) {
        return switch (revType) {
            case ADD -> "INSERT";
            case MOD -> "UPDATE";
            case DEL -> "DELETE";
            default -> "UNKNOWN";
        };
    }

}