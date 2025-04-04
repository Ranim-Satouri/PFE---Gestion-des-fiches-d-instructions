package com.pfe.backend.Service;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Model.UserZone;
import com.pfe.backend.Model.Zone;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;

public interface UserIservice {
   void ModifyUserRole(long idUser, Role newRole, long idActionneur);
   void ModifyUserStatus(long idUser, String newStatus, long idActionneur);
   ResponseEntity<List<User>> getAllUsers();
   ResponseEntity<List<User>> getUsers();
   User updateUser(Long idUser, User updatedUser, Long idActionneur);
   List<Object[]> getUserHistory(Long userId);
   void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur);
   List<User> findByRole(Role role);
   Set<UserZone> getUserZones(Long idUser);
   void retirerZoneAUser(Long idUser, Long idZone, Long idActionneur);
//   public void addZone(Zone zone, Long idActionneur);
}
