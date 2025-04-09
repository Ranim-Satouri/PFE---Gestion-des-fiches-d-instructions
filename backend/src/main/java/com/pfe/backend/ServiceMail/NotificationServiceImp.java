package com.pfe.backend.ServiceMail;


import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImp implements NotificationService {
    @Autowired
    private EmailService emailService;

    @Override
    public void notifyIPDFAboutFicheInjection(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String expirationDate = fiche.getExpirationDate().toString();
        String ipdfEmail = fiche.getIPDF().getEmail();
        String ipdfName = fiche.getIPDF().getPrenom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Nouvelle fiche à valider - " + produitName + " - " + zoneName;
        String text = "Bonjour " + ipdfName + ",\n\n"
                + "Une nouvelle fiche a été ajoutée par le préparateur " + preparateurName + " et nécessite votre validation. Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation :" + expirationDate + "\n\n"
                + "Vous pouvez valider ou rejeter cette fiche en accédant à l'application avant la date d'expiration. Si aucune action n'est effectuée avant cette date, la fiche sera automatiquement marquée comme expirée.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(ipdfEmail, subject, text);
    }

    public void notifyIQPAboutFicheValidationByIPDF(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String expirationDate = fiche.getExpirationDate().toString();
        String iqpEmail = fiche.getIQP().getEmail();
        String iqpName = fiche.getIQP().getPrenom();
        String validatorName = fiche.getActionneur().getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Nouvelle fiche d'instruction à valider - " + produitName + " - " + zoneName;
        String text = "Bonjour " + iqpName + ",\n\n"
                + "La fiche d'instruction suivante a été validée par "+ validatorName + " et nécessite maintenant votre validation. Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + expirationDate + "\n\n"
                + "Vous devez ajouter la fiche AQL en accédant à l'application avant la date d'expiration. Si aucune action n'est effectuée avant cette date, la fiche sera automatiquement marquée comme expirée.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(iqpEmail, subject, text);
    }

    public void notifyPreparateurAboutIPDFRejection(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String expirationDate = fiche.getExpirationDate().toString();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String commentaire = fiche.getCommentaire();
        String rejectedBy = fiche.getActionneur().getPrenom() + " " +fiche.getActionneur().getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction rejetée - " + produitName + " - " + zoneName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche que vous avez ajoutée a été rejetée par " + rejectedBy + ". Voici les détails de cette fiche :\n\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + expirationDate + "\n"
                + "Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Vous pouvez consulter la fiche dans l'application pour plus de détails et apporter les modifications nécessaires avant de la soumettre à nouveau.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }


    public void notifyPreparateurAboutFicheFinalValidation(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String validationDate = fiche.getExpirationDate().toString();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction validée avec succès - " + produitName + " - " + zoneName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche que vous avez ajoutée a été validée avec succès par tous les intervenants. Voici les détails de cette fiche :\n\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date de validation : " + validationDate + "\n\n"
                + "La fiche est maintenant active et peut être utilisée dans le processus de production.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }

    public void notifyPreparateurAboutIPDFAcceptance(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String expirationDate = fiche.getExpirationDate().toString();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String ipdfName = fiche.getIPDF().getPrenom() + " " +fiche.getIPDF().getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction validée par l'IPDF - " + produitName + " - " + zoneName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche que vous avez ajoutée a été validée par l'IPDF " + ipdfName + ". Voici les détails de cette fiche :\n\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + expirationDate + "\n\n"
                + "La fiche est maintenant en attente de l'ajout de la fiche AQL par l'IQP. Vous serez informé dès que la fiche AQL sera ajoutée et que la validation finale sera effectuée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }

    public void notifySuperUserAboutNewFiche(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String ipdfName = fiche.getIPDF().getPrenom() + " " + fiche.getIPDF().getNom();
        String iqpName = fiche.getIQP().getPrenom() + " " + fiche.getIQP().getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Nouvelle fiche d'instruction ajoutée - " + produitName + " - " + zoneName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "Une nouvelle fiche a été ajoutée par le préparateur " + preparateurName + ". Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "Cette fiche sera validée par :\n"
                + "- IPDF : " + ipdfName + "\n"
                + "- IQP : " + iqpName + "\n\n"
                + "- Date d'expiration de validation : " + fiche.getExpirationDate() + "\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    public void notifySuperUserAboutIPDFValidation(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String ipdfName =fiche.getIPDF().getPrenom()+ " " + fiche.getIPDF().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction validée par l'IPDF - " + produitName + " - " + zoneName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été validée par l'IPDF " + ipdfName + ". Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + fiche.getExpirationDate() + "\n\n"
                + "La fiche est maintenant en attente de l'ajout de la fiche AQL par l'IQP.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }

    public void notifySuperUserAboutAQLAddition(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String iqpName = fiche.getIQP().getPrenom() + " " + fiche.getIQP().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche AQL ajoutée - " + produitName + " - " + zoneName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche AQL a été ajoutée par l'IQP " + iqpName + ". Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + fiche.getExpirationDate() + "\n\n"
                + "La fiche est maintenant en attente de validation finale.\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    public void notifySuperUserAboutFicheExpiration(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction expirée - " + produitName + " - " + zoneName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a expiré car aucune action n'a été effectuée avant la date d'expiration. Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + fiche.getExpirationDate() + "\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    public void notifySuperUserAboutIPDFRejection(Fiche fiche, User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = fiche.getZone().getNom();
        String ipdfName = fiche.getIPDF().getPrenom() + " " + fiche.getIPDF().getNom(); // Nom de l'IPDF
        String commentaire = fiche.getCommentaire(); // Raison du rejet (si disponible)
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        String subject = "Fiche d'instruction rejetée par l'IPDF - " + produitName + " - " + zoneName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été rejetée par l'IPDF " + ipdfName + ". Voici les détails de cette fiche :\n\n"
                + "- Préparateur : " + preparateurName + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Date d'expiration de validation : " + fiche.getExpirationDate() + "\n\n"
                + "Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Pour accéder à la fiche, cliquez sur le lien suivant : https://www.youtube.com \n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches\n"
                + "Sagemcom";
        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
}
