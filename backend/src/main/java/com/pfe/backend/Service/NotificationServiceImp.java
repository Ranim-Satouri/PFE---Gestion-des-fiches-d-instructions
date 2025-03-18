package com.pfe.backend.Service;


import com.pfe.backend.Model.Fiche;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImp implements NotificationService {
    @Autowired
    private EmailService emailService;

    @Override
    public void notifyIPDFAboutFicheInjection(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String expirationDate = fiche.getExpirationDate();
        String ipdfEmail = fiche.getIPDF().getEmail();
        String ipdfName = fiche.getIPDF().getNom();

        // Construire le sujet et le corps de l'e-mail
        String subject = "Nouvelle fiche à valider - " + produitName + " - " + zoneName;
        String text = "Bonjour " + ipdfName + ",\n\n"
                + "Une nouvelle fiche a été ajoutée par le préparateur " + preparateurName + " et nécessite votre validation. Voici les détails de cette fiche :\n\n"
                + "- **Préparateur :** " + preparateurName + "\n"
                + "- **Produit :** " + produitName + "\n"
                + "- **Zone :** " + zoneName + "\n"
                + "- **Date d'expiration de validation :** " + expirationDate + "\n\n"
                + "Vous pouvez valider ou rejeter cette fiche en accédant à l'application avant la date d'expiration. Si aucune action n'est effectuée avant cette date, la fiche sera automatiquement marquée comme expirée.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        // Envoyer l'e-mail à l'IPDF
        emailService.sendEmail(ipdfEmail, subject, text);
    }
}
