package com.pfe.backend.Service.ServiceUser;
import com.pfe.backend.Model.*;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Repository.UserZoneRepository;
import com.pfe.backend.Repository.ZoneRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
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
    private EntityManager entityManager; // Permet d'utiliser Hibernate Envers
    @Override
    public List<Object[]> getUserHistory(Long userId) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        return auditReader.createQuery()
                .forRevisionsOfEntity(User.class, false, true)
                .add(AuditEntity.id().eq(userId)) // Filtrer par ID de l'utilisateur
                .getResultList();
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
