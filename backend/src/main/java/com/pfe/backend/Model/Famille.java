package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Audited

public class Famille {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFamille;


    private String nomFamille;

}
