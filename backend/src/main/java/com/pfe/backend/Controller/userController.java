package com.pfe.backend.Controller;

import com.pfe.backend.DTO.UserDTO;
import com.pfe.backend.Model.User;
import com.pfe.backend.Service.ServiceUser.UserIservice;
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

    @GetMapping("/getAll")
    public ResponseEntity<List<UserDTO>> getAllUsers(){
        return  userIservice.getAllUsers();}

    @GetMapping("/getUsers")
    public ResponseEntity<List<UserDTO>> getUsers(){
        return userIservice.getUsers();
    }
    @PutMapping("/ModifyGroup/{idUser}/{idGroupe}/{idActionneur}")
    public ResponseEntity<?> ModifyUserGroupe(@PathVariable long idUser, @PathVariable long idGroupe, @PathVariable long idActionneur)
    {
        try {
            userIservice.ModifyUserGroupe(idUser, idGroupe, idActionneur);  // Appel de la méthode dans le service
            return ResponseEntity.ok().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());  // Si un utilisateur est introuvable
        }
    }

    @PutMapping("/changeStatus/{idUser}/{idActionneur}")

    public ResponseEntity<?>ModifyUserStatus(@PathVariable long idUser, @RequestParam String newStatus,@PathVariable long idActionneur)
    {
        try {
            userIservice.ModifyUserStatus(idUser, newStatus, idActionneur);  // Appel de la méthode dans le service
            return ResponseEntity.ok().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/update/{idUser}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long idUser,
            @RequestBody User updatedUser,
            @RequestParam Long idActionneur)
    {    User updated = userIservice.updateUser(idUser, updatedUser, idActionneur);
        return ResponseEntity.ok(updated);    }

    @GetMapping("/history/{id}")
    public List<Object[]> getUserHistory(@PathVariable Long id) {
        return userIservice.getUserHistory(id);
    }
//    @PostMapping("/attribueZone/{idUser}/{idZone}/{idActionneur}")
//    public ResponseEntity<?> attribuerZoneAUser(
//            @PathVariable long idUser,
//            @PathVariable long idZone,
//            @PathVariable long idActionneur
//    ) {
//        System.out.println("hani hne");
//        try {
//            System.out.println("hani hne2");
//
//            userIservice.attribuerZoneAUser(idUser, idZone, idActionneur);
//            return ResponseEntity.ok(null);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//    }
//    @DeleteMapping("/retirerZoneAUser/{idUser}/{idZone}/{idActionneur}")
//    public ResponseEntity<?> removeAllZones(
//            @PathVariable long idUser,
//            @PathVariable long idZone,
//            @PathVariable long idActionneur
//    ) {
//        try {
//            userIservice.retirerZoneAUser(idUser, idZone, idActionneur);
//            return ResponseEntity.ok(null);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//    }
//
//    @GetMapping("/user-zones/{idUser}")
//    public Set<UserZone> getUserZones(@PathVariable Long idUser) {
//
//        return userIservice.getUserZones(idUser);
//    }
}

