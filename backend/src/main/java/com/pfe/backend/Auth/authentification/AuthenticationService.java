package com.pfe.backend.Auth.authentification;
import com.pfe.backend.Auth.Config.JwtService;
import com.pfe.backend.Auth.Exception.InactiveAccountException;
import com.pfe.backend.Auth.Exception.NoGroupException;
import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.GroupeRepository;
import com.pfe.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
@Service

@RequiredArgsConstructor
public class AuthenticationService {
    @Autowired
    private final UserRepository repository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final AuthenticationManager authenticationManager;
    @Autowired
    private final GroupeRepository groupeRepository;
    public AuthenticationResponse register(RegisterRequest request, Long idCreator) {
        //this register will allow us to create a user , save it to the db and return the generated token out of it
        // Récupérer l'email de l'utilisateur qui crée le compte (SuperUser/Admin)
        boolean isDatabaseEmpty = repository.count() == 0;
        if (repository.existsByMatricule(request.getMatricule())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un utilisateur avec ce matricule existe déjà.");
        }
        User user;
        Groupe groupe= null;

        if (isDatabaseEmpty) {
            //step 1 , il faut creer d'abord le grp superuser since no user exists db is empty
            groupe = groupeRepository.findByNom("SUPERUSER");
            if(groupe==null){throw new RuntimeException("Le Groupe superuser n'a pas été crée correctement il faut vérifier le DataInitializer");}
            // Créer le premier utilisateur sans actionneur
            user = User.builder().nom(request.getNom()).prenom(request.getPrenom()).matricule(request.getMatricule())
                    .email(request.getEmail())
                    .groupe(groupe)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .genre(request.getGenre()).num(request.getNum())
                    .status(request.getStatus() != null ? request.getStatus() : User.UserStatus.ACTIVE)
                    .actionneur(null) // Pas d'actionneur pour le premier utilisateur
                    .build();
            groupe.addUser(user);
            user=repository.save(user);
            //optionille si on veut que le 1er utilisateur soit l'actionneur dans le grp
            groupe.setActionneur(user);
            groupeRepository.save(groupe);
        } else {
            // Groupe peut être null ici
            if (request.getIdGroupe() != null) {
                groupe = groupeRepository.findById(request.getIdGroupe())
                        .orElse(null); // on ne lève pas d'exception
            }
            User creator = repository.findById(idCreator)
                    .orElseThrow(() -> new RuntimeException("Créateur du compte introuvable"));
            // Créer un utilisateur normal avec un actionneur
            user = User.builder()
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .matricule(request.getMatricule())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .genre(request.getGenre())
                    .num(request.getNum())
                    .status(request.getStatus() != null ? request.getStatus() : User.UserStatus.ACTIVE)
                    .actionneur(creator)
                    .build();
              if (groupe != null) {
                  groupe.addUser(user); // uniquement si groupe non null
              }
            user = repository.save(user);
        }
            var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
            //we need to encode our pwd before saving it so we neeed to inject our passwordencoder Service
        String groupeNom = user.getGroupe() != null ? user.getGroupe().getNom() : "Aucun groupe";
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .user(user)
                .groupe(user.getGroupe() != null ? user.getGroupe().getNom() : "Aucun groupe")
                .build();
    }
    public AuthenticationResponse authenticate(AuthenticationRequest request,HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getMatricule(), request.getPassword())
            );
            System.out.println("Authentification réussie pour: " + request.getMatricule());
        } catch (BadCredentialsException e) {
            System.out.println("Erreur d'authentification pour matricule: " + request.getMatricule() + ", erreur: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Matricule ou mot de passe incorrect");
        } catch (Exception e) {
            System.out.println("Erreur inattendue pour matricule: " + request.getMatricule() + ", erreur: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors de l'authentification");
        }

        User user = repository.findByMatricule(request.getMatricule())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        System.out.println("Utilisateur trouvé: " + user.getMatricule() + ", groupe: " + (user.getGroupe() != null ? user.getGroupe().getNom() : "aucun"));
        if (user.getStatus() == null || user.getStatus() == User.UserStatus.INACTIVE) {
            System.out.println("Utilisateur inactif");
            throw new InactiveAccountException();
        }
        if (user.getGroupe() == null || user.getGroupe().equals("Aucun groupe")) {
            throw new NoGroupException();
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        // Ajouter le refreshToken dans un cookie sécurisé
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true); // Protège contre XSS
        refreshTokenCookie.setSecure(true); // HTTPS uniquement
        refreshTokenCookie.setPath("/api/v1/auth"); // Limite le cookie au chemin d'authentification
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // Durée de vie : 7 jours (ajuste selon tes besoins)
        refreshTokenCookie.setAttribute("SameSite", "Strict"); // Protège contre CSRF
        response.addCookie(refreshTokenCookie);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(user)
                .groupe(user.getGroupe() != null ? user.getGroupe().getNom() : "Aucun groupe")
                .build();
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
