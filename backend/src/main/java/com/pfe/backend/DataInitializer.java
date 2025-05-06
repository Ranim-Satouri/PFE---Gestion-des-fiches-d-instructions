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
        // Création des menus avec leurs permissions
        createMenuWithPermissions("Dashboard", List.of("consulter_dashboard"));

        createMenuWithPermissions("fiches", List.of(
                "consulter_fiche", "creer_fiche", "modifier_fiche", "supprimer_fiche",
                "valider_fiche_IQP", "valider_fiche_IPDF" , "consulter_historique_fiche"
        ));

        createMenuWithPermissions("utilisateurs", List.of(
                "consulter_utilisateur", "creer_utilisateur", "modifier_utilisateur",
                "supprimer_utilisateur", "activer_desactiver_utilisateur" ,"consulter_historique_utilisateur"
        ));

        createMenuWithPermissions("zones", List.of(
                "consulter_zone", "creer_zone", "modifier_zone", "supprimer_zone"
        ));

        createMenuWithPermissions("produits", List.of(
                "consulter_produit", "creer_produit", "modifier_produit", "supprimer_produit"
        ));

        createMenuWithPermissions("familles", List.of(
                "consulter_famille", "creer_famille", "modifier_famille", "supprimer_famille"
        ));

        createMenuWithPermissions("groupes", List.of(
                "consulter_groupe", "creer_groupe", "modifier_groupe", "supprimer_groupe"
        ));

        createMenuWithPermissions("lignes", List.of(
                "consulter_ligne", "creer_ligne", "modifier_ligne", "supprimer_ligne"
        ));

        createMenuWithPermissions("operations", List.of(
                "consulter_operation", "creer_operation", "modifier_operation", "supprimer_operation"
        ));
        addSuperuserGroupIfNotExists();
    }

    private void createMenuWithPermissions(String menuName, List<String> permissions) {
        // Vérifie si le menu existe déjà
        Menu menu = menuRepository.findByNom(menuName);
        if (menu == null) {
            menu = new Menu();
            menu.setNom(menuName);
            menu = menuRepository.save(menu);
        }
        System.out.println(permissions);
        // Ajoute les permissions liées à ce menu
        for (String permName : permissions) {
            if (permissionRepository.findByNom(permName) == null) {
                System.out.println(permName);
                Permission permission = new Permission();
                permission.setNom(permName);
                permission.setMenu(menu); // Lien vers le menu
                System.out.println(permission.getMenu().getIdMenu());
                permissionRepository.save(permission);
            }
        }
    }

    private void addMenuIfNotExists(String menuName) {
        if (menuRepository.findByNom(menuName) == null) {  // Vérifier si le menu existe déjà
            Menu menu = new Menu();
            menu.setNom(menuName);
            menuRepository.save(menu);
        }
    }

//    private void addPermissionIfNotExists(String permissionName) {
//        if (permissionRepository.findByNom(permissionName) == null) {  // Vérifier si la permission existe déjà
//            Permission permission = new Permission();
//            permission.setNom(permissionName);
//            permissionRepository.save(permission);
//        }
//    }

    private void addSuperuserGroupIfNotExists() {
        if (groupeRepository.findByNom("SUPERUSER") == null) {
            // Fetch all  permissions
            List<Permission> allPermissions = permissionRepository.findAll();

            // Create the "SUPERUSER" group
            // Create the "SUPERUSER" group with initialized lists
            Groupe superuserGroup = Groupe.builder()
                    .nom("SUPERUSER")
                    .actionneur(null)
                    .modifieLe(LocalDateTime.now())
                    .users(new ArrayList<>())
                    .permissions(new ArrayList<>()) // Initialize here
                    .isDeleted(false)
                    .build();

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
