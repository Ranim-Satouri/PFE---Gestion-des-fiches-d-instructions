package com.pfe.backend.Repository;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusNot(User.UserStatus status);
    List<User> findByRole(Role role);
    Optional<User> findByMatricule(String matricule);
}
