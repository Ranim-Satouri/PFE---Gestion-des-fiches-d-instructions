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
@Builder
@Audited
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idPermission;
    private String nom;

    @ManyToMany(mappedBy = "permission", fetch = FetchType.LAZY)
    private List<Groupe> groupes;
}
