package com.pfe.backend.Repository;

import com.pfe.backend.Model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    Menu findByNom(String nom);
}
