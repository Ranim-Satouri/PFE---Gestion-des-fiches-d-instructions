package com.pfe.backend.DTO;
import com.pfe.backend.Model.User;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserHistoryDTO {
    // Métadonnées de la révision
    private int revisionNumber;
    private Date revisionDate;
    private String changeType; // CREATED, MODIFIED, DELETED
    private String actionneurMatricule; // Matricule de l'actionneur

    // Champs de l'utilisateur à cette révision (excluant role)
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

    // Liste complète des zones à cette révision
    private List<String> zones;

    // Changements des zones (userZones)
    private List<UserZoneChangeDTO> zoneChanges;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserZoneChangeDTO {
        private Long zoneId;
        private String zoneName;
        private String changeType; // ADD, REMOVE
    }
}
