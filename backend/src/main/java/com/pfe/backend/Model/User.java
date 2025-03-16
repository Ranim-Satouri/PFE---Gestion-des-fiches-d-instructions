package com.pfe.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.envers.Audited;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import lombok.Builder;
import lombok.Data;
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder // Assurez-vous que cette annotation est bien après les constructeurs
@Audited
@Entity
public class User implements UserDetails {
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



    @ManyToOne
    @JoinColumn(name = "actionneur")
    private User actionneur;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true; //lezmemha tebda true otherwise we won't
        //be able to connect our user
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
    @Override
    public String getPassword()
    {
        return password;
    }
}
