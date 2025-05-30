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
@Builder
@ToString
@Audited
public class Ligne {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idLigne;
    private String nom;
    private boolean isDeleted = false;

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now();

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;

    @ManyToOne
    @JoinColumn(name = "idZone")
    private Zone zone;

    @JsonIgnore
    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Operation> operations;
}
