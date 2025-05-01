package com.pfe.backend.Auth.authentification;

import com.pfe.backend.Model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationService Aservice;
    @GetMapping("/profile")
    public ResponseEntity<String> getUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok("Profil de l'utilisateur : " + auth.getName());
    }
    public AuthenticationController(AuthenticationService Aservice) {
        this.Aservice = Aservice;
    }

//    @PostMapping("/register")
//    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
//        return ResponseEntity.ok(Aservice.register(request, request.getActionneur()));
//    }
@PostMapping("/register")
public ResponseEntity<AuthenticationResponse> register(
        @RequestBody RegisterRequest request,
        @RequestParam(required = false) Long idCreator) {
    System.out.println("d5alna");
    System.out.println(request);
    try {
        System.out.println("hani f try");
        AuthenticationResponse response = Aservice.register(request, idCreator);
        return ResponseEntity.ok(response);
    } catch (ResponseStatusException e) {
        throw e;
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Une erreur est survenue lors de l'enregistrement", e);
    }
}
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(Aservice.authenticate(request));
    }
    @PutMapping("/{idUser}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable Long idUser,
            @RequestParam String newPassword,
            @RequestParam Long idActionneur) {

        Aservice.updatePassword(idUser, newPassword, idActionneur);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

}
