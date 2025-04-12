package com.pfe.backend;

import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;
import com.pfe.backend.Repository.MenuRepository;
import com.pfe.backend.Repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Vérifier et insérer les menus
        addMenuIfNotExists("Dashboard");
        addMenuIfNotExists("fiches");
        addMenuIfNotExists("utilsateurs");
        addMenuIfNotExists("zones");
        addMenuIfNotExists("produits");
        addMenuIfNotExists("familles");
        addMenuIfNotExists("groupes");
        addMenuIfNotExists("lignes");
        addMenuIfNotExists("operations");

        // Vérifier et insérer les permissions
        addPermissionIfNotExists("view_user");
        addPermissionIfNotExists("delete_user");
        addPermissionIfNotExists("create_user");
        addPermissionIfNotExists("update_user");

    }

    private void addMenuIfNotExists(String menuName) {
        if (menuRepository.findByNom(menuName) == null) {  // Vérifier si le menu existe déjà
            Menu menu = new Menu();
            menu.setNom(menuName);
            menuRepository.save(menu);
        }
    }

    private void addPermissionIfNotExists(String permissionName) {
        if (permissionRepository.findByNom(permissionName) == null) {  // Vérifier si la permission existe déjà
            Permission permission = new Permission();
            permission.setNom(permissionName);
            permissionRepository.save(permission);
        }
    }
}
