package com.pfe.backend.Service.ServiceUser;

import com.pfe.backend.DTO.UserHistoryDTO;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.UserZone;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;

public interface UserIservice {
    ResponseEntity<List<User>> getAllUsers();
    ResponseEntity<List<User>> getUsers();
    List<UserHistoryDTO> getUserHistory(Long userId);
    void ModifyUserStatus(long idUser, String newStatus, long idActionneur);
    User updateUser(Long idUser, User updatedUser, Long idActionneur);
    void ModifyUserGroupe(long idUser, long idGroupe, long idActionneur);
    void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur);
    void attribuerGroupe(long idUser,long idGroupe,long idActionneur);
    ResponseEntity<List<User>> findByGroupe(String nom);
    Set<UserZone> getUserZones(Long idUser);
    void retirerZoneAUser(Long idUser, Long idZone, Long idActionneur);
    ResponseEntity<List<User>> findByIdGroupe(long IdGroupe);
//   public void addZone(Zone zone, Long idActionneur);
}
