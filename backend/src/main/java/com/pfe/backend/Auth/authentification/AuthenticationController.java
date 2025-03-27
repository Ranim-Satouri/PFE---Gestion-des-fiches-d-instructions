package com.pfe.backend.Auth.authentification;

import com.pfe.backend.Model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationService Aservice;

    public AuthenticationController(AuthenticationService Aservice) {
        this.Aservice = Aservice;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(Aservice.register(request, request.getActionneur()));
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
