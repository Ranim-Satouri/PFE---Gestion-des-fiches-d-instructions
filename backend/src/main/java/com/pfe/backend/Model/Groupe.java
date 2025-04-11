package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder // Assurez-vous que cette annotation est bien après les constructeurs
@Audited
public class Groupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idGroupe;
    private String nom;
    private boolean isDeleted = false;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now();

//    les relations
@JsonIgnore
@OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
private List<User> users;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "groupe_permissions",joinColumns = @JoinColumn(name = "idGroupe"),
            inverseJoinColumns = @JoinColumn(name = "idPermission"))
    private List<Permission> permission;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "groupe_menus",joinColumns = @JoinColumn(name = "idGroupe"),
            inverseJoinColumns = @JoinColumn(name = "idMenu"))
    private List<Menu> menus;
}
