package com.pfe.backend.Controller;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/dashboard")
@RestController
public class DashboardController {
    @Autowired
    private FicheRepository ficheRepository;
    @Autowired private FamilleRepository familleRepository;
    @Autowired private ZoneRepository zoneRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProduitRepository produitRepository;
    @Autowired private OperationRepository operationRepository;
    @Autowired private LigneRepository ligneRepository;
    @Autowired private GroupeRepository groupeRepository;
    //@Autowired private FicheHistoriqueRepository historiqueRepository;
    @Autowired private EntityManager entityManager;

    @GetMapping("/kpis")
    public Map<String, Long> getKpis() {
        Map<String, Long> kpis = new HashMap<>();
        kpis.put("fiches", ficheRepository.count());
        kpis.put("familles", familleRepository.count());
        kpis.put("zones", zoneRepository.count());
        kpis.put("utilisateurs", userRepository.count());
        kpis.put("produits", produitRepository.count());
        kpis.put("operations", operationRepository.count());
        kpis.put("lignes", ligneRepository.count());
        kpis.put("groupes", groupeRepository.count());
        return kpis;
    }

    @GetMapping("/fiches-by-status")
    public Map<String, Long> getFichesByStatus() {
        return Arrays.stream(Fiche.FicheStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        status -> ficheRepository.countByStatus(status)
                ));
    }

    @GetMapping("/fiches-transitions-metrics")
    public List<Map<String, Object>> getFicheTransitionMetrics() {
        String sql = """
                WITH ordered AS (
                  SELECT id_fiche, status, modifie_le,
                         ROW_NUMBER() OVER (PARTITION BY id_fiche ORDER BY modifie_le) AS rn
                  FROM fiche_AUD
                ),
                pending_ipdf AS (
                  SELECT p.id_fiche,
                         TIMESTAMPDIFF(SECOND, p.modifie_le, n.modifie_le) AS duree
                  FROM ordered p
                  JOIN ordered n ON p.id_fiche = n.id_fiche AND n.rn = p.rn + 1
                  WHERE p.status = 'PENDING' AND n.status IN ('ACCEPTEDIPDF', 'REJECTEDIPDF')
                ),
                ipdf_iqp AS (
                  SELECT p.id_fiche,
                         TIMESTAMPDIFF(SECOND, p.modifie_le, n.modifie_le) AS duree
                  FROM ordered p
                  JOIN ordered n ON p.id_fiche = n.id_fiche AND n.rn = p.rn + 1
                  WHERE p.status = 'ACCEPTEDIPDF' AND n.status IN ('ACCEPTEDIQP', 'REJECTEDIQP')
                ),
                full_process AS (
                  SELECT p.id_fiche,
                         TIMESTAMPDIFF(SECOND, p.modifie_le, i.modifie_le) AS duree
                  FROM (
                    SELECT id_fiche, MIN(modifie_le) AS modifie_le FROM fiche_AUD WHERE status = 'PENDING' GROUP BY id_fiche
                  ) p
                  JOIN (
                    SELECT id_fiche, MIN(modifie_le) AS modifie_le FROM fiche_AUD WHERE status = 'ACCEPTEDIQP' GROUP BY id_fiche
                  ) i ON p.id_fiche = i.id_fiche
                  WHERE i.modifie_le > p.modifie_le
                ),
                agg_pending_ipdf AS (
                  SELECT id_fiche, SUM(duree) AS total_duree, COUNT(*) AS cycles FROM pending_ipdf GROUP BY id_fiche
                ),
                agg_ipdf_iqp AS (
                  SELECT id_fiche, SUM(duree) AS total_duree, COUNT(*) AS cycles FROM ipdf_iqp GROUP BY id_fiche
                ),
                agg_full_process AS (
                  SELECT id_fiche, SUM(duree) AS total_duree, COUNT(*) AS cycles FROM full_process GROUP BY id_fiche
                )
                SELECT 'Pending → Validation IPDF' AS transition,
                       ROUND(AVG(total_duree)/3600, 2) AS avg_hours,
                       ROUND(MIN(total_duree)/3600, 2) AS min_hours,
                       ROUND(MAX(total_duree)/3600, 2) AS max_hours,
                       ROUND(AVG(cycles), 2) AS avg_cycles_per_fiche,
                       SUM(cycles) AS total_cycles,
                       COUNT(*) AS fiches_concerned
                FROM agg_pending_ipdf
                UNION ALL
                SELECT 'Validation IPDF → Validation IQP',
                       ROUND(AVG(total_duree)/3600, 2),
                       ROUND(MIN(total_duree)/3600, 2),
                       ROUND(MAX(total_duree)/3600, 2),
                       ROUND(AVG(cycles), 2),
                       SUM(cycles),
                       COUNT(*)
                FROM agg_ipdf_iqp
                UNION ALL
                SELECT 'Pending → Final IQP',
                       ROUND(AVG(total_duree)/3600, 2),
                       ROUND(MIN(total_duree)/3600, 2),
                       ROUND(MAX(total_duree)/3600, 2),
                       ROUND(AVG(cycles), 2),
                       SUM(cycles),
                       COUNT(*)
                FROM agg_full_process
                """;

        Query nativeQuery = entityManager.createNativeQuery(sql);
        List<Object[]> rows = nativeQuery.getResultList();

        List<Map<String, Object>> results = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("transition", row[0]);
            map.put("avg_hours", row[1]);
            map.put("min_hours", row[2]);
            map.put("max_hours", row[3]);
            map.put("avg_cycles_per_fiche", row[4]);
            map.put("total_cycles", row[5]);
            map.put("fiches_concerned", row[6]);
            results.add(map);
        }

        return results;
    }
}
