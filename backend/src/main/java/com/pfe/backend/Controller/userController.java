package com.pfe.backend.Controller;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Service.UserIservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/user")
@RestController
public class userController {
    @Autowired
    private UserIservice userIservice;
    @PutMapping("/{idUser}/role")
    public ResponseEntity<?> ModifyUserRole(@PathVariable long idUser, @RequestParam Role newRole, @RequestParam long idActionneur)
    {
        try {
            userIservice.ModifyUserRole(idUser, newRole, idActionneur);  // Appel de la méthode dans le service
            return ResponseEntity.ok("Rôle de l'utilisateur modifié avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());  // Si un utilisateur est introuvable
        }
    }
    @PutMapping("/{idUser}/status")
    public ResponseEntity<?>ModifyUserStatus(@PathVariable long idUser, @RequestParam String newStatus,@RequestParam long idActionneur)
    {
        try {
            userIservice.ModifyUserStatus(idUser, newStatus, idActionneur);  // Appel de la méthode dans le service
            return ResponseEntity.ok("Status modified successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<User>> getUsers(){
        return  userIservice.getUsers();
    }
}

