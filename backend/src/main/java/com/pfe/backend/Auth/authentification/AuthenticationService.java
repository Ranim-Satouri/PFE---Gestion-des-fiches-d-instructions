package com.pfe.backend.Auth.authentification;


import com.pfe.backend.Auth.Config.JwtService;
import com.pfe.backend.Model.Role;
import com.pfe.backend.Model.User;
import com.pfe.backend.Repository.userRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final userRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
       //this register will allow us to create a user , save it to the db and return the generated token out of it
     var user = User.builder()
            .nom(request.getNom())
            .prenom(request.getPrenom())
             .matricule(request.getMatricule())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
             .role(request.getRole() != null ? request.getRole() : Role.OPERATEUR) // Valeur par défaut si null
             .genre(request.getGenre())
             .num(request.getNum())
             .status(request.getStatus() != null ? request.getStatus() : User.UserStatus.ACTIVE) // Valeur par défaut
             .build();
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
                .token(jwtToken).build();

    }
}
