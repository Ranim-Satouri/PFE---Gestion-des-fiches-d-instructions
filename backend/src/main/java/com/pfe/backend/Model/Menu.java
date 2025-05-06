package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import org.springframework.security.access.PermissionCacheOptimizer;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Audited
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idMenu;
    private String nom;

//    @JsonIgnore
//    @ManyToMany(mappedBy = "menus", fetch = FetchType.LAZY)
//    private List<Groupe> groupes;

    @JsonIgnore
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL)
    private List<Permission> permissions= new ArrayList<>();
}
