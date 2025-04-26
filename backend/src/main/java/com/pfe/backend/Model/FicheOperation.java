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
@DiscriminatorValue("OPERATION")
public class FicheOperation extends Fiche {

    @ManyToOne
    @JoinColumn(name = "idOperation", nullable = true)
    private Operation operation;
}
