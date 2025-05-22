package com.pfe.backend.DTO;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class FicheAdvancedDTO {
    private String text;
    private List<FicheDTO> fiches;

}
