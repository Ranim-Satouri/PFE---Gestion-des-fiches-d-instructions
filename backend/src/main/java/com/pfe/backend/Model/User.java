package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.envers.Audited;

@Audited
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idUser;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String genre;
    private String num;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private UserStatus status;
    public enum UserStatus{
        ACTIVE, INACTIVE ,DELETED;
    }
    @Enumerated(EnumType.STRING)
    private Role role;
    @ManyToMany
    @JoinTable(
            name = "user_zone",
            joinColumns = @JoinColumn(name = "idUser"),
            inverseJoinColumns = @JoinColumn(name = "idZone")
    )
    private Set<Zone> zones = new HashSet<>();

    @OneToMany(mappedBy = "preparateur")
    private List<Fiche> fichesPreparateur;

    @OneToMany(mappedBy = "IPDF")
    private List<Fiche> fichesIPDF;

    @OneToMany(mappedBy = "IQP")
    private List<Fiche> fichesIQP;

}
