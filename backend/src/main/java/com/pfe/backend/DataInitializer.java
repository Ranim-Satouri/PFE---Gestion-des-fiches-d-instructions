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
import java.util.stream.Collectors;

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
                "consulter_fiche_validées","consulter_fiche_non_validées", "creer_fiche", "modifier_fiche", "supprimer_fiche",
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
        addPreparateurGroupIfNotExists();
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
    private void addPreparateurGroupIfNotExists() {
        if (groupeRepository.findByNom("PREPARATEUR") == null) {
            // Récupérer les menus nécessaires
            Menu fichesMenu = menuRepository.findByNom("fiches");
            Menu lignesMenu = menuRepository.findByNom("lignes");
            Menu operationsMenu = menuRepository.findByNom("operations");
            Menu zonesMenu = menuRepository.findByNom("zones");
            Menu dashboard = menuRepository.findByNom("Dashboard");
            Menu produit = menuRepository.findByNom("produits");
            Menu famille = menuRepository.findByNom("familles");
            // Vérifier que tous les menus existent
            if (fichesMenu == null || lignesMenu == null || operationsMenu == null || zonesMenu == null || dashboard == null || produit == null || famille == null) {
                throw new IllegalStateException("Un ou plusieurs menus (fiches, lignes, operations, zones) doivent exister avant de créer le groupe PREPARATEUR");
            }
            System.out.println("Menus trouvés : fiches (ID = " + fichesMenu.getIdMenu() + "), lignes (ID = " + lignesMenu.getIdMenu() + "), operations (ID = " + operationsMenu.getIdMenu() + "), zones (ID = " + zonesMenu.getIdMenu() + ")");

            // Récupérer les permissions
            // 1. Permissions de "fiches" sauf "consulter_historique_fiche"
            List<Permission> fichesPermissions = permissionRepository.findByMenu(fichesMenu)
                    .stream()
                    .filter(permission -> !List.of("consulter_historique_fiche", "valider_fiche_IQP", "valider_fiche_IPDF").contains(permission.getNom()))
                    .collect(Collectors.toList());
            List<Permission> famillePermissions = permissionRepository.findByMenu(famille)
                    .stream()
                    .filter(permission -> !permission.getNom().equals("supprimer_famille"))
                    .collect(Collectors.toList());
            // 2. Toutes les permissions de "lignes"
            List<Permission> lignesPermissions = permissionRepository.findByMenu(lignesMenu);
            List<Permission> dashboardPermissions = permissionRepository.findByMenu(dashboard);
            List<Permission> produitPermissions = permissionRepository.findByMenu(produit);
            // 3. Toutes les permissions de "operations"
            List<Permission> operationsPermissions = permissionRepository.findByMenu(operationsMenu);

            // 4. Permission "consulter_zone" de "zones"
            List<Permission> zonePermission = permissionRepository.findByMenu(zonesMenu)
                    .stream()
                    .filter(permission -> permission.getNom().equals("consulter_zone"))
                    .collect(Collectors.toList());

            // Combiner toutes les permissions
            List<Permission> preparateurPermissions = new ArrayList<>();
            preparateurPermissions.addAll(fichesPermissions);
            preparateurPermissions.addAll(lignesPermissions);
            preparateurPermissions.addAll(operationsPermissions);
            preparateurPermissions.addAll(zonePermission);
            preparateurPermissions.addAll(dashboardPermissions);
            preparateurPermissions.addAll(produitPermissions);
            preparateurPermissions.addAll(famillePermissions);
            System.out.println("Permissions pour PREPARATEUR : " + preparateurPermissions.stream().map(Permission::getNom).collect(Collectors.toList()));

            // Créer le groupe "PREPARATEUR"
            Groupe preparateurGroup = Groupe.builder()
                    .nom("PREPARATEUR")
                    .actionneur(null)
                    .modifieLe(LocalDateTime.now())
                    .users(new ArrayList<>())
                    .permissions(new ArrayList<>())
                    .isDeleted(false)
                    .build();

            // Associer les permissions au groupe
            for (Permission permission : preparateurPermissions) {
                if (permission.getGroupes() == null) {
                    permission.setGroupes(new ArrayList<>());
                }
                preparateurGroup.addPermission(permission);
                System.out.println("Permission ajoutée à PREPARATEUR : " + permission.getNom());
            }

            // Sauvegarder le groupe
            groupeRepository.save(preparateurGroup);
            System.out.println("Groupe PREPARATEUR créé avec " + preparateurPermissions.size() + " permissions");
        } else {
            System.out.println("Groupe PREPARATEUR déjà existant");
        }
    }
}
