package com.pfe.backend.Repository;

import com.pfe.backend.Model.User;
import com.pfe.backend.Model.UserZone;
import com.pfe.backend.Model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserZoneRepository extends JpaRepository<UserZone, Long> {
    Optional<UserZone> findByUserAndZone(User user, Zone zone);

}
