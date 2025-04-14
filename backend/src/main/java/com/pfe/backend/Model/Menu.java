package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idMenu;
    private String nom;

    @JsonIgnore
    @ManyToMany(mappedBy = "menus", fetch = FetchType.LAZY)
    private List<Groupe> groupes;
}
