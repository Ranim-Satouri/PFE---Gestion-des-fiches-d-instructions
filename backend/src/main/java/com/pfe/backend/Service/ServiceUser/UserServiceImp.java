package com.pfe.backend.Service.ServiceUser;
import com.pfe.backend.DTO.UserHistoryDTO;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.UserZoneRepository;
import com.pfe.backend.Repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur) {

    User user = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Zone zone = zoneRepo.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));
        // Vérifier si la zone est déjà attribuée à l'utilisateur
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
    public void retirerZoneAUser(Long idUser, Long idZone, Long idActionneur) {
        // Vérifier si les entités existent
        User user = userRepo.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Zone zone = zoneRepo.findById(idZone)
                .orElseThrow(() -> new RuntimeException("Zone introuvable"));

        var userZoneOpt = userZoneRepository.findByUserAndZone(user, zone);

        if (userZoneOpt.isEmpty()) {
            throw new RuntimeException("Aucune liaison entre cet utilisateur et cette zone");
        }
        userZoneRepository.delete(userZoneOpt.get());
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
    @PersistenceContext
    private EntityManager entityManager;
    @Transactional(readOnly = true)
    public List<UserHistoryDTO> getUserHistory(Long userId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);

        // Récupérer les révisions de l'utilisateur
        List<Object[]> userRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(User.class, false, true)
                .add(AuditEntity.id().eq(userId))
                .getResultList();

        // Vérifier que l'utilisateur existe
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        // Récupérer les révisions des relations UserZone
        List<Object[]> userZoneRevisions = auditReader.createQuery()
                .forRevisionsOfEntity(UserZone.class, false, true)
                .add(AuditEntity.property("user").eq(user))
                .getResultList();

        // Ajouter un log pour vérifier les révisions de UserZone
        System.out.println("Nombre de révisions de UserZone trouvées : " + userZoneRevisions.size());
        for (Object[] userZoneRevision : userZoneRevisions) {
            UserZone userZone = (UserZone) userZoneRevision[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) userZoneRevision[1];
            String revisionType = userZoneRevision[2].toString();
            System.out.println("Révision UserZone - Numéro: " + revisionEntity.getId() +
                    ", Zone: " + userZone.getZone().getNom() +
                    ", Type: " + revisionType);
        }

        // Map pour stocker les changements de zones par révision
        Map<Integer, List<UserHistoryDTO.UserZoneChangeDTO>> zoneChangesByRevision = new HashMap<>();

        // Traiter les révisions de UserZone pour les changements
        for (Object[] userZoneRevision : userZoneRevisions) {
            UserZone userZone = (UserZone) userZoneRevision[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) userZoneRevision[1];
            String revisionType = userZoneRevision[2].toString();
            int revisionNumber = revisionEntity.getId();

            UserHistoryDTO.UserZoneChangeDTO zoneChange = UserHistoryDTO.UserZoneChangeDTO.builder()
                    .zoneId(userZone.getZone().getIdZone())
                    .zoneName(userZone.getZone().getNom())
                    .changeType(revisionType.equals("ADD") ? "ADD" : revisionType.equals("DELETE") ? "REMOVE" : "MODIFY")
                    .build();

            zoneChangesByRevision.computeIfAbsent(revisionNumber, k -> new ArrayList<>()).add(zoneChange);
        }

        // Reconstituer l'état des zones à chaque révision de User
        Map<Integer, Set<String>> zonesByRevision = new HashMap<>();
        Set<String> currentZones = new TreeSet<>(); // Utiliser TreeSet pour un tri naturel des noms de zones

        // Parcourir toutes les révisions de UserZone dans l'ordre croissant
        List<Object[]> sortedUserZoneRevisions = userZoneRevisions.stream()
                .sorted((r1, r2) -> Integer.compare(
                        ((DefaultRevisionEntity) r1[1]).getId(),
                        ((DefaultRevisionEntity) r2[1]).getId()))
                .collect(Collectors.toList());

        // Trier les révisions de User dans l'ordre croissant pour construire l'état des zones
        List<Object[]> sortedUserRevisions = new ArrayList<>(userRevisions);
        sortedUserRevisions.sort((r1, r2) -> {
            DefaultRevisionEntity rev1 = (DefaultRevisionEntity) r1[1];
            DefaultRevisionEntity rev2 = (DefaultRevisionEntity) r2[1];
            int dateComparison = Long.compare(rev1.getTimestamp(), rev2.getTimestamp());
            if (dateComparison != 0) {
                return dateComparison;
            }
            return Integer.compare(rev1.getId(), rev2.getId());
        });

        // Itérer sur les révisions de UserZone pour mettre à jour currentZones
        Iterator<Object[]> userZoneIterator = sortedUserZoneRevisions.iterator();
        Object[] nextUserZoneRevision = userZoneIterator.hasNext() ? userZoneIterator.next() : null;

        // Construire l'état des zones pour chaque révision de User
        for (Object[] userRevision : sortedUserRevisions) {
            DefaultRevisionEntity userRevEntity = (DefaultRevisionEntity) userRevision[1];
            int userRevNumber = userRevEntity.getId();

            // Traiter toutes les révisions de UserZone qui se trouvent avant ou à la révision actuelle
            while (nextUserZoneRevision != null) {
                DefaultRevisionEntity zoneRevEntity = (DefaultRevisionEntity) nextUserZoneRevision[1];
                int zoneRevNumber = zoneRevEntity.getId();

                // Si la révision de UserZone est antérieure ou égale à la révision de User
                if (zoneRevNumber <= userRevNumber) {
                    UserZone userZone = (UserZone) nextUserZoneRevision[0];
                    String revisionType = nextUserZoneRevision[2].toString();
                    String zoneName = userZone.getZone().getNom();

                    // Mettre à jour l'état des zones
                    if (revisionType.equals("ADD")) {
                        currentZones.add(zoneName);
                    } else if (revisionType.equals("DELETE")) {
                        currentZones.remove(zoneName);
                    }

                    // Passer à la révision suivante de UserZone
                    nextUserZoneRevision = userZoneIterator.hasNext() ? userZoneIterator.next() : null;
                } else {
                    break;
                }
            }

            // Sauvegarder l'état des zones pour cette révision de User
            zonesByRevision.put(userRevNumber, new TreeSet<>(currentZones));
            System.out.println("État des zones à la révision " + userRevNumber + " : " + currentZones);
        }

        // Construire l'historique de l'utilisateur dans l'ordre décroissant
        List<UserHistoryDTO> history = new ArrayList<>();
        // Trier userRevisions par date et numéro de révision (décroissant)
        userRevisions.sort((r1, r2) -> {
            DefaultRevisionEntity rev1 = (DefaultRevisionEntity) r1[1];
            DefaultRevisionEntity rev2 = (DefaultRevisionEntity) r2[1];
            int dateComparison = Long.compare(rev2.getTimestamp(), rev1.getTimestamp());
            if (dateComparison != 0) {
                return dateComparison;
            }
            return Integer.compare(rev2.getId(), rev1.getId());
        });

        // Construire les DTOs avec les zones correctes
        for (Object[] revisionData : userRevisions) {
            User currentUser = (User) revisionData[0];
            DefaultRevisionEntity revisionEntity = (DefaultRevisionEntity) revisionData[1];
            String revisionType = revisionData[2].toString();
            int revisionNumber = revisionEntity.getId();

            String actionneurMatricule = "system";
            if (currentUser.getActionneur() != null && currentUser.getActionneur().getMatricule() != null) {
                actionneurMatricule = currentUser.getActionneur().getNom() + " " + currentUser.getActionneur().getPrenom();
            }

            // Récupérer les zones à cette révision
            Set<String> zonesAtRevision = zonesByRevision.getOrDefault(revisionNumber, new TreeSet<>());

            UserHistoryDTO historyEntry = UserHistoryDTO.builder()
                    .revisionNumber(revisionEntity.getId())
                    .revisionDate(new Date(revisionEntity.getTimestamp()))
                    .changeType(revisionType.equals("ADD") ? "CREATED" : revisionType.equals("DELETE") ? "DELETED" : "MODIFIED")
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
                    .zones(new ArrayList<>(zonesAtRevision))
                    .zoneChanges(zoneChangesByRevision.getOrDefault(revisionNumber, new ArrayList<>()))
                    .build();

            history.add(historyEntry);
            System.out.println("Révision " + revisionNumber + " - Zones attribuées : " + zonesAtRevision);
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
