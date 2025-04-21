package com.pfe.backend.Model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@DiscriminatorValue("ZONE")
public class FicheZone extends Fiche {

    @ManyToOne
    @JoinColumn(name = "idZone", nullable = false)
    private Zone zone;

}
