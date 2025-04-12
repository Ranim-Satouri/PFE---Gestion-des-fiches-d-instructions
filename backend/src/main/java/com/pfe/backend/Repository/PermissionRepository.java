package com.pfe.backend.Repository;

import com.pfe.backend.Model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Permission findByNom(String nom);
}
