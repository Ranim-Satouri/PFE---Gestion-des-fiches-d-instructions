package com.pfe.backend.Model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FamilleHistory {
    private Integer revisionNumber;
    private LocalDateTime modifieLe;
    private String actionneurFullName;
    private String nom;
    private boolean isDeleted;
    private List<String> zones;
}
