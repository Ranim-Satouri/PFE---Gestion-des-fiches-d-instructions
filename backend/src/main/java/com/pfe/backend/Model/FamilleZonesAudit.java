package com.pfe.backend.Model;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FamilleZonesAudit {
    private Integer revisionNumber;
    private LocalDateTime modifieLe;
    private String actionneurFullName;
    private String revisionType; // ADD, MOD, DEL
    private List<String> zones; //
}
