package com.pfe.backend.Auth.authentification;

import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String matricule;
    private String email;
    private String password;
    private Groupe groupe;
    private User.UserGenre genre;
    private String num;
    private User.UserStatus status;
    private Long actionneur;
}
