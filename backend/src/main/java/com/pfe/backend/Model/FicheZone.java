package com.pfe.backend.Model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

@Entity
@Getter
@Setter
@Audited
@DiscriminatorValue("ZONE")
public class FicheZone extends Fiche {

    @ManyToOne
    @JoinColumn(name = "idZone", nullable = true)
    private Zone zone;

}
