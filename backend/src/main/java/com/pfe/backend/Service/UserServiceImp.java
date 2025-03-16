package com.pfe.backend.Service;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImp implements UserIservice{
    @Autowired
    private UserRepository userRepo;
    @Override
    public void changeUserRole(long idUser, Role newRole, long idActionneur)
    {
        User newUser = userRepo.findById(idUser).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        User updater =userRepo.findById(idActionneur).orElseThrow(() -> new RuntimeException("Actionneur introuvable"));
        newUser.setRole(newRole);
        newUser.setActionneur(updater);
        userRepo.save(newUser);

    }

}
