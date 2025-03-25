package com.pfe.backend.Model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Audited
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_zone")
public class UserZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "idZone", nullable = false)
    private Zone zone;

    @Column(name = "idActionneur", nullable = false)
    private Long idActionneur;

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now(); // Ajoute une valeur par défaut

}
