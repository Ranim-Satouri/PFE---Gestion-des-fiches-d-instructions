package com.pfe.backend.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
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
@JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
@EqualsAndHashCode(exclude = {"groupe", "actionneur", "userZones"}) // Exclude cyclic fields
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idUser;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    @JsonIgnore
//    @NotAudited
    private String password;
    private String num;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private UserStatus status;
    public enum UserStatus{ ACTIVE, INACTIVE ,DELETED ; }

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserZone> userZones = new HashSet<>();
    public void addZone(Zone zone, Long idActionneur) {
        UserZone userZone = new UserZone();
        userZone.setUser(this);
        userZone.setZone(zone);
        userZone.setIdActionneur(idActionneur);
        this.userZones.add(userZone);}
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)    private UserGenre genre;
    public enum UserGenre { FEMME , HOMME ; }

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now(); // Ajoute une valeur par défaut

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actionneur")
    private User actionneur;

    @ManyToOne
    @JoinColumn(name = "idGroupe")
    private Groupe groupe;
    public void setGroupe(Groupe groupe) {this.groupe = groupe ;}
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    if (groupe == null) {
        return List.of(); // Return an empty list if no group is assigned
    }
    return List.of(new SimpleGrantedAuthority(groupe.getNom()));
}
    @Override
    public String getUsername() {return matricule;}
    @Override
    public boolean isAccountNonExpired() {
        return true; //lezmemha tebda true otherwise we won't //be able to connect our user
    }
    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Override
    public String getPassword() { return password; }
}
