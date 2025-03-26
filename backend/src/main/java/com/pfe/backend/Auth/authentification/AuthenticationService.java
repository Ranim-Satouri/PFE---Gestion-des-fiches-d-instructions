package com.pfe.backend.Auth.authentification;


import com.pfe.backend.Auth.Config.JwtService;
import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request, Long idCreator) {
       //this register will allow us to create a user , save it to the db and return the generated token out of it
        // Récupérer l'email de l'utilisateur qui crée le compte (SuperUser/Admin)
//        User creator = repository.findById(idCreator)
//                .orElseThrow(() -> new RuntimeException("Créateur du compte introuvable"));
        // Vérifier si la base de données est vide
        boolean isDatabaseEmpty = repository.count() == 0;

        User user;
        if (isDatabaseEmpty) {
            // Créer le premier utilisateur sans actionneur
            user = User.builder()
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .matricule(request.getMatricule())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.SUPERUSER) // Attribuer un rôle spécifique (par exemple, ADMIN)
                    .genre(request.getGenre())
                    .num(request.getNum())
                    .status(request.getStatus() != null ? request.getStatus() : User.UserStatus.ACTIVE)
                    .actionneur(null) // Pas d'actionneur pour le premier utilisateur
                    .build();
        } else {
            // Récupérer l'utilisateur créateur (actionneur)
            User creator = repository.findById(idCreator)
                    .orElseThrow(() -> new RuntimeException("Créateur du compte introuvable"));

            // Créer un utilisateur normal avec un actionneur
            user = User.builder()
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .matricule(request.getMatricule())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole() != null ? request.getRole() : Role.OPERATEUR) // Valeur par défaut
                    .genre(request.getGenre())
                    .num(request.getNum())
                    .status(request.getStatus() != null ? request.getStatus() : User.UserStatus.ACTIVE)
                    .actionneur(creator) // Enregistrer l'actionneur
                    .build();
        }
    repository.save(user);
        
    var jwtToken = jwtService.generateToken(user);
    //we need to encode our pwd before saving it so we neeed to inject our passwordencoder Service
        return AuthenticationResponse.builder()
                        .token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
       authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
       var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken).role(user.getRole()).build();

    }
    public void updatePassword(Long idUser, String newPassword, Long idActionneur) {
        User user = repository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        User actionneur = repository.findById(idActionneur)
                .orElseThrow(() -> new RuntimeException("Actionneur introuvable"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setActionneur(actionneur);

        repository.save(user);
    }
}
