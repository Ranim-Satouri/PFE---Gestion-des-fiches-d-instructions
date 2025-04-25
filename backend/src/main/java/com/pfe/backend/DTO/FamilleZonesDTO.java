package com.pfe.backend.DTO;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FamilleZonesDTO {
    private Integer revisionNumber;
    private LocalDateTime modifieLe;
    private String actionneurFullName;
    private String revisionType; // ADD, MOD, DEL
    private List<String> zones; //
}
