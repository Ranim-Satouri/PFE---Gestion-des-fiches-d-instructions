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
@DiscriminatorValue("OPERATION")
public class FicheOperation extends Fiche {

    @ManyToOne
    @JoinColumn(name = "idOperation", nullable = false)
    private Operation operation;
}
