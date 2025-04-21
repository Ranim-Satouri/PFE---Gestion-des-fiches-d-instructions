package com.pfe.backend.Service.ServiceGroupe;

import com.pfe.backend.Model.Groupe;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface GroupeService {
    ResponseEntity<?> addGroupe(Groupe groupe , Long idActionneur);
    ResponseEntity<?> updateGroupe(Long idGroupe, Groupe NewGroupeData , Long idActionneur);
    void DeleteGroupe(Long idGroupe ,Long idActionneur);
    List<Groupe> getActiveGroupes();
    List<Groupe> getGroupes();
    Groupe addRelationsToGroup(Long groupId, List<Long> menuIds, List<Long> permissionIds, List<Long> userIds , Long idActionneur);
}
