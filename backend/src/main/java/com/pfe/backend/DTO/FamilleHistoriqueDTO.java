package com.pfe.backend.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FamilleHistoriqueDTO {
    private Integer revisionNumber;
    private LocalDateTime modifieLe;
    private String actionneurFullName;
    private String nom;
    private boolean isDeleted;
    private List<String> zones;
}
