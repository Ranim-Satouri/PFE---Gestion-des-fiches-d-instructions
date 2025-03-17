package com.pfe.backend.Service;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserIservice {
   public void ModifyUserRole(long idUser, Role newRole, long idActionneur);
   public void ModifyUserStatus(long idUser, String newStatus, long idActionneur);
   ResponseEntity<List<User>> getAllUsers();
   ResponseEntity<List<User>> getUsers();
   public User updateUser(Long idUser, User updatedUser, Long idActionneur);

}
