package com.pfe.backend.Auth.Config;

import com.pfe.backend.Model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "refresh_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Date expiryDate;

    @Column(nullable = false)
    private boolean revoked;

    public boolean isExpired() {
        boolean expired = expiryDate.before(new Date()) || revoked;
        System.out.println("Checking if token is expired - expiryDate: " + expiryDate + ", revoked: " + revoked + ", expired: " + expired);
        return expired;
    }
}