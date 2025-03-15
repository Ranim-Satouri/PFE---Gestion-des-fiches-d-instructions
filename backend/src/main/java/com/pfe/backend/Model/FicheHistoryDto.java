package com.pfe.backend.Model;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FicheHistoryDto {
    private int revision;
    private String timestamp;
    private String type;
    private String modifiedBy;
    private Fiche fiche;

    public FicheHistoryDto(int revision, long timestamp, String type,  Fiche fiche) {
        this.revision = revision;
        this.timestamp = convertTimestamp(timestamp);
        this.type = type;
        this.fiche = fiche;
    }

    private String convertTimestamp(long timestamp) {
        return java.time.Instant.ofEpochMilli(timestamp).toString();
    }

    // Getters...
}