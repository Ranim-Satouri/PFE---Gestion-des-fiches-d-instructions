package com.pfe.backend.Service;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserIservice {
   void ModifyUserRole(long idUser, Role newRole, long idActionneur);
   void ModifyUserStatus(long idUser, String newStatus, long idActionneur);
   ResponseEntity<List<User>> getAllUsers();
   ResponseEntity<List<User>> getUsers();
   User updateUser(Long idUser, User updatedUser, Long idActionneur);
   List<Object[]> getUserHistory(Long userId);
   void attribuerZoneAUser(Long idUser, Long idZone, Long idActionneur);
   public List<User> findByRole(Role role);
}
