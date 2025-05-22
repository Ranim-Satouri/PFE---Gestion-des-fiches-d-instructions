package com.pfe.backend.DTO;

import lombok.*;

@Getter
@Setter
@ToString
public class FicheDTO {
    private Long id;
    private String filename;
    public FicheDTO(Long idFiche, String fileName) {
        this.id = idFiche;
        this.filename = fileName;
    }
}
