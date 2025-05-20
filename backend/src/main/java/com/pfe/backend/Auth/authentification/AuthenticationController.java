package com.pfe.backend.Auth.authentification;

import com.pfe.backend.Auth.Config.JwtService;
//import com.pfe.backend.Auth.Config.RefreshTokenRequest;
import com.pfe.backend.Auth.Config.RefreshTokenRepository;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.locks.ReentrantLock;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationService Aservice;
    @Autowired
    private  JwtService jwtService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    private final ReentrantLock refreshLock = new ReentrantLock();
    public AuthenticationController(AuthenticationService Aservice) {
        this.Aservice = Aservice;
    }
    @GetMapping("/profile")
    public ResponseEntity<String> getUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok("Profil de l'utilisateur : " + auth.getName());
    }
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request, HttpServletResponse response)
    { return ResponseEntity.ok(Aservice.authenticate(request, response)); }

    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<AuthenticationResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        // Lire le refreshToken depuis le cookie
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;}
            }
        }
        if (refreshToken == null) {
            System.out.println("No refresh token provided in cookies");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token provided");
        }
        System.out.println("Processing refresh token: " + refreshToken);

        // Valider le refreshToken
        String matricule;
        try {
            matricule = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            System.out.println("Failed to extract username from refresh token: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token format");
        }

        // Verrouiller l'utilisateur avec un verrou pessimiste
        User user = userRepository.findByMatriculeWithLock(matricule)
                .orElseThrow(() -> {
                    System.out.println("User not found for matricule: " + matricule);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé");
                });

        // Vérifier si le refresh token est valide dans la base
        if (!jwtService.isRefreshTokenValid(refreshToken, user)) {
            System.out.println("Invalid or revoked refresh token: " + refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or revoked refresh token");
        }

        try {
            // Révoquer les autres refresh tokens de l'utilisateur (sauf celui en cours)
            System.out.println("Revoking other refresh tokens for user: " + matricule);
            refreshTokenRepository.revokeOtherTokens(user, refreshToken);

            // Générer un nouvel accessToken et refreshToken
            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken;
            try {
                newRefreshToken = jwtService.generateRefreshToken(user);
            } catch (Exception e) {
                System.out.println("Failed to generate new refresh token: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate new refresh token");
            }

            // Ajouter le nouveau refreshToken dans un cookie sécurisé
            Cookie refreshTokenCookie = new Cookie("refreshToken", newRefreshToken);
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/api/v1/auth");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
            refreshTokenCookie.setAttribute("SameSite", "Strict");
            response.addCookie(refreshTokenCookie);
            System.out.println("New refresh token set in cookie: " + newRefreshToken);

            // Retourner la réponse avec le nouvel accessToken
            return ResponseEntity.ok(AuthenticationResponse.builder()
                    .token(newAccessToken)
                    .user(user)
                    .groupe(user.getGroupe() != null ? user.getGroupe().getNom() : "Aucun groupe")
                    .build());
        } catch (ObjectOptimisticLockingFailureException e) {
            System.out.println("Optimistic locking failure during refresh token processing: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Concurrent refresh token processing detected, please retry");
        } catch (Exception e) {
            System.out.println("Unexpected error during refresh token processing: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Service temporarily unavailable, please retry");
        }
    }
@PostMapping("/register")
public ResponseEntity<AuthenticationResponse> register(
        @RequestBody RegisterRequest request,
        @RequestParam(required = false) Long idCreator) {
    System.out.println("d5alna");
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
//    @PostMapping("/authenticate")
//    public ResponseEntity<AuthenticationResponse> authenticate(
//            @RequestBody AuthenticationRequest request,
//            HttpServletResponse response) {
//        return ResponseEntity.ok(Aservice.authenticate(request, response));
//    }
    @PutMapping("/password/{idUser}")
    public ResponseEntity<String> updatePassword(
            @PathVariable Long idUser, @RequestParam String newPassword,  @RequestParam Long idActionneur) {
        try {
            // Validation minimale
            if (newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            Aservice.updatePassword(idUser, newPassword, idActionneur);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("Erreur lors de la mise à jour du mot de passe");
            return ResponseEntity.internalServerError().build();
        }
    }
    @PutMapping("/reset-password/{idUser}/{idActionneur}")
    public ResponseEntity<?> ResetPassword(
            @PathVariable Long idUser,  @PathVariable Long idActionneur) {
        try {
            Aservice.ResetPassword(idUser, idActionneur);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
