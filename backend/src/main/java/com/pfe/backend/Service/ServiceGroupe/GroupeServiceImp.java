package com.pfe.backend.Service.ServiceGroupe;

import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.MenuRepository;
import com.pfe.backend.Repository.PermissionRepository;
import com.pfe.backend.Repository.UserRepository;
import com.pfe.backend.Service.ServiceUser.UserIservice;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class GroupeServiceImp implements GroupeService {
    @Autowired
    private UserRepository userRepository;
    private GroupeRepository groupeRepository;
    private MenuRepository menuRepository;
    private PermissionRepository permissionRepository;
    private UserIservice userService;
    public ResponseEntity<?> addGroupe(Groupe groupe , Long idActionneur){
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Groupe> existingGroupe = groupeRepository.findBynomAndIsDeleted(groupe.getNom(), false);
        if(existingGroupe.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("un groupe avec le même nom existe déjà");
        }
        groupe.setActionneur(actionneur);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(groupeRepository.save(groupe));
    }

    @Override
    public ResponseEntity<?> updateGroupe(Long idGroupe, Groupe NewGroupeData , Long idActionneur)
    {
        Groupe groupe = groupeRepository.findById(idGroupe).orElseThrow(()-> new RuntimeException("Groupe introuvable ! "));
        User actionneur = userRepository.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        Optional<Groupe> existingGroupe = groupeRepository.findBynomAndIsDeleted(NewGroupeData.getNom(), false);
        if(existingGroupe.isPresent()){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("un groupe avec le même nom existe déjà");
        }
        if(NewGroupeData.getNom()!=null ) groupe.setNom(NewGroupeData.getNom());
        groupe.setActionneur(actionneur);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(groupeRepository.save(groupe));
    }

    @Override
    public void DeleteGroupe(Long idGroupe ,Long idActionneur)
    {
       Groupe groupe = groupeRepository.findById(idGroupe).orElseThrow(()-> new RuntimeException("Groupe introuvable ! "));
        User actionneur = userRepository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        List<User> users = userRepository.findByGroupe(groupe);
        for (User user : users) {
            user.setGroupe(null);
            user.setActionneur(actionneur);
            userRepository.save(user);
        }
        groupe.setActionneur(actionneur);
        groupe.setDeleted(true);
        groupeRepository.save(groupe);

    }
    @Override
    public List<Groupe> getActiveGroupes() {
        return groupeRepository.findByIsDeletedFalse();
    }

    @Override
    public List<Groupe> getGroupes() {
        return groupeRepository.findAll();
    }

    @Override
    public Groupe addRelationsToGroup(Long groupId, List<Long> permissionIds, List<Long> userIds , Long idActionneur) {
        Groupe groupe = groupeRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

//        List<Menu> selectedMenus = menuRepository.findAllById(menuIds);
//        groupe.setMenus(selectedMenus);

        List<Permission> selectedPermissions = permissionRepository.findAllById(permissionIds);
        groupe.setPermissions(selectedPermissions);

        List<User> currentUsers = new ArrayList<>(groupe.getUsers());
        for (User user : currentUsers) {
            if (!userIds.contains(user.getIdUser())) {
                user.setGroupe(null);
                userRepository.save(user);
            }
        }
        List<User> selectedUsers = userRepository.findAllById(userIds);
        for (User user : selectedUsers) {
            userService.attribuerGroupe(user.getIdUser(), groupe.getIdGroupe(), idActionneur);
        }
        return groupeRepository.save(groupe);
    }
}
