package com.pfe.backend.DTO;

import lombok.*;

@Getter
@Setter
@ToString
public class FicheDTO {
    private Long idFiche;
    private String fileName;
    public FicheDTO(Long idFiche, String fileName) {
        this.idFiche = idFiche;
        this.fileName = fileName;
    }
}
