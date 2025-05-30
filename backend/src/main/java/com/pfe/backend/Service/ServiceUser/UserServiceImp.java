package com.pfe.backend.Service.ServiceUser;
import com.pfe.backend.DTO.UserHistoryDTO;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.UserZoneRepository;
import com.pfe.backend.Repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImp implements UserIservice {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ZoneRepository zoneRepo;
    @Autowired
    private UserZoneRepository userZoneRepository;
    @Autowired
    private GroupeRepository groupeRepo;
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur) {

    User user = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Zone zone = zoneRepo.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        boolean zoneDejaAttribuee = user.getUserZones().stream()
                .anyMatch(userZone -> userZone.getZone().getIdZone()== idZone);
        if (zoneDejaAttribuee) {
            throw new RuntimeException("La zone est déjà attribuée à cet utilisateur");
        }
        user.addZone(zone, idActionneur);
        userRepo.save(user);
    }
    @Override
    public void attribuerGroupe(long idUser,long idGroupe,long idActionneur)
    {
        User user = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        User actionneur = userRepo.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Groupe grp = groupeRepo.findById(idGroupe)
                .orElseThrow(() -> new RuntimeException("Groupe introuvable"));
        user.setGroupe(grp);
        user.setActionneur(actionneur);
        userRepo.save(user);
    }
    @Override
    @Transactional
    public void retirerZoneAUser(Long idUser, Long idZone, Long idActionneur) {
        try {
            User user = userRepo.findById(idUser)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
            Zone zone = zoneRepo.findById(idZone)
                    .orElseThrow(() -> new RuntimeException("Zone introuvable"));
            User actionneur = userRepo.findById(idActionneur)
                    .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

            var userZoneOpt = userZoneRepository.findByUserAndZone(user, zone);

            if (userZoneOpt.isEmpty()) {
                throw new RuntimeException("Aucune liaison entre cet utilisateur et cette zone");
            }

            UserZone userZone = userZoneOpt.get();
            Long userZoneId = userZone.getId();
            System.out.println("Before deletion - UserZoneId: " + userZoneId +
                    ", UserId: " + (userZone.getUser() != null ? userZone.getUser().getIdUser() : "null") +
                    ", ZoneId: " + (userZone.getZone() != null ? userZone.getZone().getIdZone() : "null") +
                    ", UserNull: " + (userZone.getUser() == null) +
                    ", ZoneNull: " + (userZone.getZone() == null) +
                    ", IdActionneur: " + userZone.getIdActionneur() +
                    ", ModifieLe: " + userZone.getModifieLe());

            // Créer une nouvelle révision dans revinfo
            System.out.println("Inserting into revinfo");
            Query revInfoQuery = entityManager.createNativeQuery(
                    "INSERT INTO revinfo (revtstmp) VALUES (?)"
            );
            revInfoQuery.setParameter(1, System.currentTimeMillis());
            revInfoQuery.executeUpdate();

            // Récupérer le numéro de révision
            System.out.println("Selecting MAX(rev) from revinfo");
            Query maxRevQuery = entityManager.createNativeQuery(
                    "SELECT MAX(rev) FROM revinfo"
            );
            Integer newRev = ((Number) maxRevQuery.getSingleResult()).intValue();
            System.out.println("New revision number: " + newRev);

            // Insérer révision DEL manuelle
            System.out.println("Inserting into user_zone_aud: id=" + userZoneId + ", id_user=" + idUser +
                    ", id_zone=" + idZone + ", rev=" + newRev + ", revtype=2");
            Query insertQuery = entityManager.createNativeQuery(
                    "INSERT INTO user_zone_aud (id, id_user, id_zone, rev, revtype) VALUES (?, ?, ?, ?, ?)"
            );
            insertQuery.setParameter(1, userZoneId);
            insertQuery.setParameter(2, idUser);
            insertQuery.setParameter(3, idZone);
            insertQuery.setParameter(4, newRev);
            insertQuery.setParameter(5, 2); // revtype=2 pour DEL
            insertQuery.executeUpdate();
            System.out.println("Inserted into user_zone_aud");

            // Supprimer l'entité
            System.out.println("Deleting UserZone: " + userZoneId);
            userZoneRepository.delete(userZone);
            entityManager.flush();
            System.out.println("After deletion - UserZone deleted: " + userZoneId);

            // Mettre à jour l'utilisateur
            user.setModifieLe(LocalDateTime.now());
            user.setActionneur(actionneur);
            userRepo.save(user);
            System.out.println("User updated: " + idUser);
        } catch (Exception e) {
            System.err.println("Error in retirerZoneAUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Échec de la suppression de la zone: " + e.getMessage(), e);
        }
    }

    @Override
    public Set<UserZone> getUserZones(Long idUser) {

        User user = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return user.getUserZones();
    }

    @Override
    public void ModifyUserGroupe(long idUser, long idGroupe, long idActionneur)
    {
        Groupe newGroupe=groupeRepo.findById(idGroupe).orElseThrow(()->new RuntimeException("Groupe introuvable"));
        User newUser = userRepo.findById(idUser).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        User updater =userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        newUser.setGroupe(newGroupe);
        newUser.setActionneur(updater);
        userRepo.save(newUser);
    }

    @Override
    public void ModifyUserStatus(long idUser, String newStatus, long idActionneur) {
        User newUser = userRepo.findById(idUser).orElseThrow(() -> new RuntimeException("User introuvable"));
        User updater = userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        try {
            User.UserStatus status = User.UserStatus.valueOf(newStatus.toUpperCase());
            newUser.setStatus(status);
            newUser.setActionneur(updater);
            userRepo.save(newUser);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + newStatus);
        }
    }

    @Override
    public ResponseEntity<List<User>> getAllUsers()
    {
        List<User>users = userRepo.findAll();
        return ResponseEntity.ok().body(users);
    }

    @Override
    public ResponseEntity<List<User>> getUsers()
    {
        List<User>users=userRepo.findByStatusNot(User.UserStatus.DELETED);
        return ResponseEntity.ok().body(users);
    }

    @Transactional(readOnly = true)
    public Map<Integer, UserZoneHistory> getUserZoneHistory(Long userId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        User user = entityManager.find(User.class, userId);
        if (user == null) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        System.out.println("Querying user_zone_aud for userId: " + userId);
        List<Object[]> userZoneRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(UserZone.class, false, true)
                .add(AuditEntity.property("user").eq(user))
                .getResultList();
        System.out.println("Total UserZone revisions found (including DEL): " + userZoneRevisions.size());
        for (Object[] rev : userZoneRevisions) {
            RevisionType revType = (RevisionType) rev[2];
            DefaultRevisionEntity revEntity = (DefaultRevisionEntity) rev[1];
            System.out.println("Revision: " + revEntity.getId() + ", Type: " + revType.name());
        }

        List<Object[]> sortedUserZoneRevisions = userZoneRevisions.stream()
                .sorted(Comparator.comparing(r -> ((DefaultRevisionEntity) r[1]).getId()))
                .collect(Collectors.toList());

        Map<Integer, UserZoneHistory> zoneHistoryByRevision = new HashMap<>();
        Map<Long, String> currentZonesById = new HashMap<>();

        for (Object[] revisionData : sortedUserZoneRevisions) {
            UserZone userZone = (UserZone) revisionData[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revisionData[1];
            RevisionType revisionType = (RevisionType) revisionData[2];
            int revisionNumber = revisionEntity.getId();

            List<UserHistoryDTO.UserZoneChangeDTO> changes = new ArrayList<>();
            Long zoneId = null;
            String zoneName = null;

            if (revisionType == RevisionType.ADD && userZone.getZone() != null) {
                zoneId = userZone.getZone().getIdZone();
                zoneName = userZone.getZone().getNom();
                currentZonesById.put(zoneId, zoneName);
                changes.add(UserHistoryDTO.UserZoneChangeDTO.builder()
                        .zoneId(zoneId)
                        .zoneName(zoneName)
                        .changeType("ADD")
                        .build());
                System.out.println("ADD - ZoneId: " + zoneId + ", ZoneName: " + zoneName + " at revision " + revisionNumber);
            } else if (revisionType == RevisionType.DEL) {
                // Chercher id_zone dans user_zone_aud avec paramètres positionnels
                Query query = entityManager.createNativeQuery(
                        "SELECT id_zone, id_user FROM user_zone_aud WHERE id = ? AND rev = ? AND revtype = 2"
                );
                query.setParameter(1, userZone.getId());
                query.setParameter(2, revisionNumber);
                Object[] result;
                try {
                    result = (Object[]) query.getSingleResult();
                } catch (NoResultException e) {
                    System.out.println("No DEL revision found for userZoneId: " + userZone.getId() + ", rev: " + revisionNumber);
                    continue;
                }

                if (result != null && result[0] != null && result[1] != null && ((Number) result[1]).longValue() == userId) {
                    zoneId = ((Number) result[0]).longValue();
                    // Récupérer zoneName depuis zone_aud
                    Query zoneQuery = entityManager.createNativeQuery(
                            "SELECT nom FROM zone_aud WHERE id_zone = ? AND rev <= ? AND revtype != 2 ORDER BY rev DESC LIMIT 1"
                    );
                    zoneQuery.setParameter(1, zoneId);
                    zoneQuery.setParameter(2, revisionNumber);
                    try {
                        zoneName = (String) zoneQuery.getSingleResult();
                        currentZonesById.remove(zoneId);
                        changes.add(UserHistoryDTO.UserZoneChangeDTO.builder()
                                .zoneId(zoneId)
                                .zoneName(zoneName)
                                .changeType("REMOVE")
                                .build());
                        System.out.println("DEL - ZoneId: " + zoneId + ", ZoneName: " + zoneName + " at revision " + revisionNumber);
                    } catch (NoResultException e) {
                        System.out.println("No zone_aud entry found for zoneId: " + zoneId + ", rev: " + revisionNumber);
                    }
                } else {
                    System.out.println("Invalid DEL revision for userZoneId: " + userZone.getId() + ", userId: " + userId);
                }
            } else if (revisionType == RevisionType.MOD && userZone.getZone() != null) {
                zoneId = userZone.getZone().getIdZone();
                zoneName = userZone.getZone().getNom();
                System.out.println("MOD - ZoneId: " + zoneId + ", ZoneName: " + zoneName + " at revision " + revisionNumber);
            }

            UserZoneHistory history = new UserZoneHistory();
            history.zones = new ArrayList<>(new TreeSet<>(currentZonesById.values()));
            history.zoneChanges = changes;
            zoneHistoryByRevision.put(revisionNumber, history);
        }

        return zoneHistoryByRevision;
    }


    public static class UserZoneHistory {
        public List<String> zones;
        public List<UserHistoryDTO.UserZoneChangeDTO> zoneChanges;
    }


    @Transactional(readOnly = true)
    public List<UserHistoryDTO> getUserHistory(Long userId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        // Vérifier que l'utilisateur existe
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        // Récupérer les révisions de l'utilisateur
        List<Object[]> userRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(User.class, false, true)
                .add(AuditEntity.id().eq(userId))
                .getResultList();

        // Récupérer l'historique des zones
        Map<Integer, UserZoneHistory> zoneHistoryByRevision = getUserZoneHistory(userId);

        // Trier les révisions User par ordre chronologique
        List<Object[]> sortedUserRevisions = userRevisions.stream()
                .sorted((r1, r2) -> {
                    DefaultRevisionEntity rev1 = (DefaultRevisionEntity) r1[1];
                    DefaultRevisionEntity rev2 = (DefaultRevisionEntity) r2[1];
                    int dateComparison = Long.compare(rev1.getTimestamp(), rev2.getTimestamp());
                    return dateComparison != 0 ? dateComparison : Integer.compare(rev1.getId(), rev2.getId());
                }).collect(Collectors.toList());
        // Filtrer les révisions sans changement significatif
        List<Object[]> filteredRevisions = new ArrayList<>();
        Object[] previousUserRev = null;
        for (Object[] currentRev : sortedUserRevisions) {
            User currentUser = (User) currentRev[0];
            DefaultRevisionEntity currentRevEntity = (DefaultRevisionEntity) currentRev[1];
            int revNumber = currentRevEntity.getId();

            if (previousUserRev == null) {
                filteredRevisions.add(currentRev);
            } else {
                User previousUser = (User) previousUserRev[0];
                boolean hasSignificantChange =
                        !Objects.equals(currentUser.getMatricule(), previousUser.getMatricule()) ||
                                !Objects.equals(currentUser.getNom(), previousUser.getNom()) ||
                                !Objects.equals(currentUser.getPrenom(), previousUser.getPrenom()) ||
                                !Objects.equals(currentUser.getEmail(), previousUser.getEmail()) ||
                                !Objects.equals(currentUser.getNum(), previousUser.getNum()) ||
                                !Objects.equals(currentUser.getStatus(), previousUser.getStatus()) ||
                                !Objects.equals(currentUser.getGenre(), previousUser.getGenre()) ||
                                !Objects.equals(currentUser.getGroupe(), previousUser.getGroupe()) ||
                                !Objects.equals(currentUser.getPassword(), previousUser.getPassword()) ||
                                zoneHistoryByRevision.entrySet().stream()
                                        .anyMatch(entry -> entry.getKey() <= revNumber && !entry.getValue().zoneChanges.isEmpty());

                if (hasSignificantChange) {
                    filteredRevisions.add(currentRev);
                }
            }
            previousUserRev = currentRev;
        }
        // Construire les DTOs finaux avec l'historique trié (ordre décroissant)
        List<UserHistoryDTO> history = new ArrayList<>();
        filteredRevisions.sort((r1, r2) -> {
            DefaultRevisionEntity rev1 = (DefaultRevisionEntity) r1[1];
            DefaultRevisionEntity rev2 = (DefaultRevisionEntity) r2[1];
            int dateComparison = Long.compare(rev2.getTimestamp(), rev1.getTimestamp());
            return dateComparison != 0 ? dateComparison : Integer.compare(rev2.getId(), rev1.getId());});
        for (Object[] revisionData : filteredRevisions) {
            User currentUser = (User) revisionData[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revisionData[1];
            RevisionType revisionType = (RevisionType) revisionData[2];
            int revisionNumber = revisionEntity.getId();

            String actionneurMatricule = "system";
            if (currentUser.getActionneur() != null && currentUser.getActionneur().getMatricule() != null) {
                actionneurMatricule = currentUser.getActionneur().getNom() + " " + currentUser.getActionneur().getPrenom();
            }

            // Trouver l'état des zones le plus récent avant ou à cette révision
            Optional<UserZoneHistory> latestZoneHistory = zoneHistoryByRevision.entrySet().stream()
                    .filter(entry -> entry.getKey() <= revisionNumber)
                    .max(Comparator.comparing(Map.Entry::getKey))
                    .map(Map.Entry::getValue);

            List<String> zonesAtRevision = latestZoneHistory.map(h -> h.zones).orElse(new ArrayList<>());
            List<UserHistoryDTO.UserZoneChangeDTO> zoneChanges = zoneHistoryByRevision.entrySet().stream()
                    .filter(entry -> entry.getKey() == revisionNumber)
                    .flatMap(entry -> entry.getValue().zoneChanges.stream())
                    .collect(Collectors.toList());

            UserHistoryDTO historyEntry = UserHistoryDTO.builder()
                    .revisionNumber(revisionNumber)
                    .revisionDate(new Date(revisionEntity.getTimestamp()))
                    .changeType(revisionType == RevisionType.ADD ? "CREATED" :
                            revisionType == RevisionType.DEL ? "DELETED" : "MODIFIED")
                    .actionneurMatricule(actionneurMatricule)
                    .idUser(currentUser.getIdUser())
                    .matricule(currentUser.getMatricule())
                    .nom(currentUser.getNom())
                    .prenom(currentUser.getPrenom())
                    .email(currentUser.getEmail())
                    .num(currentUser.getNum())
                    .status(currentUser.getStatus())
                    .genre(currentUser.getGenre())
                    .modifieLe(currentUser.getModifieLe())
                    .groupeNom(currentUser.getGroupe() != null ? currentUser.getGroupe().getNom() : null)
                    .zones(zonesAtRevision)
                    .zoneChanges(zoneChanges)
                    .password(currentUser.getPassword())
                    .build();

            history.add(historyEntry);
            System.out.println("Révision " + revisionNumber + " - Zones attribuées : " + zonesAtRevision + ", Changements : " + zoneChanges);
        }

        return history;
    }


    @Override
    public User updateUser(Long idUser, User updatedUser, Long idActionneur) {
        User existingUser = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        User actionneur = userRepo.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        if (updatedUser.getNom() != null) existingUser.setNom(updatedUser.getNom());
        if (updatedUser.getPrenom() != null) existingUser.setPrenom(updatedUser.getPrenom());
        if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getMatricule() != null) existingUser.setMatricule(updatedUser.getMatricule());
        if (updatedUser.getGroupe() != null) {
            Long idGroupe = updatedUser.getGroupe().getIdGroupe();
            Groupe groupeFromDb = groupeRepo.findById(idGroupe)
                    .orElseThrow(() -> new RuntimeException("Groupe introuvable"));
            existingUser.setGroupe(groupeFromDb);
        } else {
            existingUser.setGroupe(null); // Cas où on veut retirer le groupe
        }        if (updatedUser.getGenre() != null) existingUser.setGenre(updatedUser.getGenre());
        if (updatedUser.getNum() != null) existingUser.setNum(updatedUser.getNum());
        if (updatedUser.getStatus() != null) existingUser.setStatus(updatedUser.getStatus());
        existingUser.setActionneur(actionneur);
       return userRepo.save(existingUser);
    }


    @Override
    public ResponseEntity<List<User>> findByGroupe(String nom)
    {
       Groupe groupe = groupeRepo.findByNom(nom);
       return ResponseEntity.ok().body(userRepo.findByGroupe(groupe));
    }

    @Override
    public ResponseEntity<List<User>> findByIdGroupe(long idGroupe)
    {
        Groupe groupe = groupeRepo.findById(idGroupe).orElseThrow(()->new RuntimeException("Groupe introuvable"));
        return ResponseEntity.ok().body(userRepo.findByGroupe(groupe));
    }
}
