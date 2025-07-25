package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
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

    @JsonIgnore
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL)
    private List<Permission> permissions= new ArrayList<>();
}
