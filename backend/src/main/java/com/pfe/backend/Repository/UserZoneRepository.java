package com.pfe.backend.Repository;

import com.pfe.backend.Model.UserZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserZoneRepository extends JpaRepository<UserZone, Long> {
}
