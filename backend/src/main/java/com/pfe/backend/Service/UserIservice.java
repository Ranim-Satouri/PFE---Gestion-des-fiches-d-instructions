package com.pfe.backend.Service;

import com.pfe.backend.Model.Role;

public interface UserIservice {
   public void changeUserRole(long idUser, Role newRole, long idActionneur);
}
