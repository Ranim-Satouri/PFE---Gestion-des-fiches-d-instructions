package com.pfe.backend.Controller;

import com.pfe.backend.Model.Role;
import com.pfe.backend.Service.UserIservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/user")
@RestController
public class userController {
    @Autowired
    private UserIservice userIservice;
    @PutMapping("/{idUser}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable long idUser,  // L'ID de l'utilisateur à modifier
            @RequestParam Role newRole,  // Le nouveau rôle de l'utilisateur
            @RequestParam long idActionneur  // L'ID de l'actionneur qui effectue la modification
    ) {
        try {
            userIservice.changeUserRole(idUser, newRole, idActionneur);  // Appel de la méthode dans le service
            return ResponseEntity.ok("Rôle de l'utilisateur modifié avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());  // Si un utilisateur est introuvable
        }
    }
}

