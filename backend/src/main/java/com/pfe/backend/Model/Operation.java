package com.pfe.backend.Model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Audited
public class Operation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idOperation;
    private String nom;
    private boolean isDeleted = false;

    @UpdateTimestamp
    @Column(name = "modifie_le", nullable = false)
    private LocalDateTime modifieLe = LocalDateTime.now();

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idActionneur", nullable = false)
    private User actionneur;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "idLigne", nullable = false)
    private Ligne ligne ;
}
