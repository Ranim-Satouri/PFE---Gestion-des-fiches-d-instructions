package com.pfe.backend.Repository;

import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Permission findByNom(String nom);
    List<Permission> findByMenu(Menu menu);
}
