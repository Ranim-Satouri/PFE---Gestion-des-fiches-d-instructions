package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserHistory {
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
    private LocalDateTime dateModification;
    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User user;


    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User Modificateur;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private User.UserStatus status;
    public enum UserStatus{
        ACTIVE, INACTIVE ,DELETED;
    }
    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToMany @JoinTable(
            name = "user_zone",
            joinColumns = @JoinColumn(name = "idUser"),
            inverseJoinColumns = @JoinColumn(name = "idZone")
    )
    private Set<Zone> zones = new HashSet<>();

}
