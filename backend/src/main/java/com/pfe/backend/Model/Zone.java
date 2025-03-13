package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Audited

public class Zone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idZone;
    private String nom;
    @ManyToMany(mappedBy = "zones") //Le mappedBy fait référence à l'attribut zones dans User
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "zone")
    private List<Fiche> fiches;

}
