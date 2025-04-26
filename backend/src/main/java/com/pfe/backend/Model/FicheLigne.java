package com.pfe.backend.Model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

@Entity
@Getter
@Setter
@Audited
@DiscriminatorValue("LIGNE")
public class FicheLigne extends Fiche {

    @ManyToOne
    @JoinColumn(name = "idLigne", nullable = true)
    private Ligne ligne;
}
