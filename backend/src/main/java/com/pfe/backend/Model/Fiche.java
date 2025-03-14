package com.pfe.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.RelationTargetAuditMode;

import java.util.List;
import org.hibernate.envers.Audited;

@Entity
@AllArgsConstructor
@NoArgsConstructor

@Audited
public class Fiche {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFiche;
    private String nomFiche;
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private FicheStatus status;
    public enum FicheStatus{
       PENDING, ACCEPTEDIPDF , ACCEPTEDIQP , REFUSED , EXPIRED ,DELETED;
    }
    private String commentaire;
    private String expirationDate;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdf;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] FicheAQL;

    @ManyToOne(cascade = CascadeType.ALL) // Plusieurs fiches peuvent appartenir à une seule zone
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JoinColumn(name = "idZone", nullable = false) // Clé étrangère
    private Zone zone;


    @ManyToOne(cascade = CascadeType.ALL) // Plusieurs fiches peuvent appartenir à une seule zone
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JoinColumn(name = "idProduit", nullable = false) // Clé étrangère
    private Produit produit;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_preparateur", nullable = false)
    private User preparateur;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_IPDF", nullable = false)
    private User IPDF;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_IQP", nullable = false)
    private User IQP;

    // Getters and Setters

    public long getIdFiche() {
        return idFiche;
    }

    public void setIdFiche(long idFiche) {
        this.idFiche = idFiche;
    }

    public String getNomFiche() {
        return nomFiche;
    }

    public void setNomFiche(String nomFiche) {
        this.nomFiche = nomFiche;
    }

    public FicheStatus getStatus() {
        return status;
    }

    public void setStatus(FicheStatus status) {
        this.status = status;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public byte[] getPdf() {
        return pdf;
    }

    public void setPdf(byte[] pdf) {
        this.pdf = pdf;
    }

    public byte[] getFicheAQL() {
        return FicheAQL;
    }

    public void setFicheAQL(byte[] ficheAQL) {
        this.FicheAQL = ficheAQL;
    }

    public Zone getZone() {
        return zone;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }

    public User getPreparateur() {
        return preparateur;
    }

    public void setPreparateur(User preparateur) {
        this.preparateur = preparateur;
    }

    public User getIPDF() {
        return IPDF;
    }

    public void setIPDF(User IPDF) {
        this.IPDF = IPDF;
    }

    public User getIQP() {
        return IQP;
    }

    public void setIQP(User IQP) {
        this.IQP = IQP;
    }
}

