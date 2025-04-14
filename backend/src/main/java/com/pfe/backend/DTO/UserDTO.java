package com.pfe.backend.DTO;
import com.pfe.backend.Model.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long idUser;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String num;
    private User.UserStatus status;
    private User.UserGenre genre;
    private LocalDateTime modifieLe;
    private String groupeNom;
}
