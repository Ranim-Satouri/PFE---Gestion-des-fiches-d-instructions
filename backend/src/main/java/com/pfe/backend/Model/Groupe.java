package com.pfe.backend.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @JsonIgnore
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = true)
    private User actionneur;

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now();

    //    les relations

    @JsonIgnore
    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users;
//il faut les initialize = new ArrayList<>() pour eviter l'exception NullPointerException,to ensure they are never null.

//    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "groupe_permissions",joinColumns = @JoinColumn(name = "idGroupe"),
            inverseJoinColumns = @JoinColumn(name = "idPermission"))
    private List<Permission> permissions= new ArrayList<>();

//    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "groupe_menus",joinColumns = @JoinColumn(name = "idGroupe"),
            inverseJoinColumns = @JoinColumn(name = "idMenu"))
    private List<Menu> menus = new ArrayList<>();;
   //helper methods , for bette functionning
    public void addUser(User user) {
        users.add(user);
        user.setGroupe(this);
    }
    public void removeUser(User user) {
        users.remove(user);
        user.setGroupe(null);
    }
    public void addPermission(Permission permission) {
        this.permissions.add(permission);
        permission.getGroupes().add(this);
    }
    public void addMenu(Menu menu) {
        this.menus.add(menu);
        menu.getGroupes().add(this);
    }
}
