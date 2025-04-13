package com.pfe.backend.Repository;

import com.pfe.backend.Model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    Menu findByNom(String nom);

    //ici pq j'ai utilisé query? khtr besh injm initializi l w n'affecti menus w permissions lel grp superuser k inrunni
    //lezemni inbadl fetch.lazy l eager  ama eager taml machekl f performance w can lead to loading unnecessar data when it's not needed so the best smartest solution is query
    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.groupes")
    List<Menu> findAllWithGroupes();
}
