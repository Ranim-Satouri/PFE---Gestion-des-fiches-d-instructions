package com.pfe.backend;

import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.MenuRepository;
import com.pfe.backend.Repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Transactional //Keeps the session open for the entire operation, allowing lazy loading to work.
//No need to change the fetch type or write custom queries.
//If the transaction fails (e.g., due to a database error), the entire initialization process will be rolled back.
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private GroupeRepository groupeRepository;

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
        addSuperuserGroupIfNotExists();
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

    private void addSuperuserGroupIfNotExists() {
        if (groupeRepository.findByNom("SUPERUSER") == null) {
            // Fetch all menus and permissions
            List<Menu> allMenus = menuRepository.findAll();
            List<Permission> allPermissions = permissionRepository.findAll();

            // Create the "SUPERUSER" group
            // Create the "SUPERUSER" group with initialized lists
            Groupe superuserGroup = Groupe.builder()
                    .nom("SUPERUSER")
                    .actionneur(null)
                    .modifieLe(LocalDateTime.now())
                    .users(new ArrayList<>())
                    .menus(new ArrayList<>()) // Initialize here
                    .permissions(new ArrayList<>()) // Initialize here
                    .isDeleted(false)
                    .build();

            // Add all menus and permissions using helper methods
            for (Menu menu : allMenus) {
                // Initialize the groupes collection if it's null
                if (menu.getGroupes() == null) {
                    menu.setGroupes(new ArrayList<>());
                }
                superuserGroup.addMenu(menu);
            }
            for (Permission permission : allPermissions) {
                // Initialize the groupes collection if it's null
                if (permission.getGroupes() == null) {
                    permission.setGroupes(new ArrayList<>());
                }
                superuserGroup.addPermission(permission);
            }

            // Save the group
            groupeRepository.save(superuserGroup);
        }
    }
}
