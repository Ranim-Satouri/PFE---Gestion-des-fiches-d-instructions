package com.pfe.backend.Repository;

import com.pfe.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
