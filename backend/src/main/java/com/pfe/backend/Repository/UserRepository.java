package com.pfe.backend.Repository;

import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusNot(User.UserStatus status);
//    List<User> findByGroupe(String nom);
    Optional<User> findByMatricule(String matricule);
    boolean existsByMatricule(String matricule);
    List<User> findByGroupe(Groupe groupe);
    List<User> findByGroupeAndUserZones_Zone(Groupe groupe , Zone zone);
}
