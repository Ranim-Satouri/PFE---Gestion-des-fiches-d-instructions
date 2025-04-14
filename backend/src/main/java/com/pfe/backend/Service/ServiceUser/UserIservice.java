package com.pfe.backend.Service.ServiceUser;

import com.pfe.backend.DTO.UserDTO;
import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserIservice {
    ResponseEntity<List<UserDTO>> getAllUsers();
    ResponseEntity<List<UserDTO>> getUsers();
    List<Object[]> getUserHistory(Long userId);
    void ModifyUserStatus(long idUser, String newStatus, long idActionneur);
    User updateUser(Long idUser, User updatedUser, Long idActionneur);
    void ModifyUserGroupe(long idUser, long idGroupe, long idActionneur);

//   void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur);
////   List<User> findByRole(Role role);
//   Set<UserZone> getUserZones(Long idUser);
//   void retirerZoneAUser(Long idUser, Long idZone, Long idActionneur);
////   public void addZone(Zone zone, Long idActionneur);
}
