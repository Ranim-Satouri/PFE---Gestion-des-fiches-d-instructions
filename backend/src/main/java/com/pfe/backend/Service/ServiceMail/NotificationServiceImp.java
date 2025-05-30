package com.pfe.backend.Service.ServiceMail;


import com.pfe.backend.Model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationServiceImp implements NotificationService {
    @Autowired
    private EmailService emailService;

    @Override
    public void notifyIPDFAboutFicheInjection(Fiche fiche , User ipdf) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String ipdfEmail = ipdf.getEmail();
        String ipdfName = ipdf.getPrenom()  + " " + ipdf.getNom();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);
        String subject = "Nouvelle fiche d'instructions à valider - " + produitName;
        String text = "Bonjour " + ipdfName + ",\n\n"
                + "Une nouvelle fiche d'instructions a été ajoutée par " + preparateurName + " et nécessite une validation.\n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n\n"
                + "Cette fiche doit être validée avant la date d'expiration. Si aucune action n'est effectuée avant cette date, la fiche sera automatiquement marquée comme expirée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";
        System.out.println(ipdfEmail + "   ipdf");
        emailService.sendEmail(ipdfEmail, subject, text);
    }

    @Override
    public void notifySuperUserAboutNewFiche(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);
        String subject = "Nouvelle fiche d'instructions ajoutée - " + produitName ;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "Une nouvelle fiche d'instructions a été ajoutée par " + preparateurName + ".\n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions \n"
                + "Sagemcom";
        System.out.println(superuser.getEmail() + "   superuser");
        emailService.sendEmail(superuser.getEmail(), subject, text);
    }

    // validation ipdf
    @Override
    public void notifyPreparateurAboutIPDFRejection(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String commentaire = fiche.getCommentaire();
        String rejectedBy = fiche.getActionneur().getPrenom() + " " +fiche.getActionneur().getNom();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);
        String subject = "Fiche d'instructions rejetée - " + produitName ;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche suivante que vous avez ajoutée a été rejetée par l'IPDF " + rejectedBy + ". \n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n"
                + "- Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }
    @Override
    public void notifyPreparateurAboutIPDFAcceptance(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String ipdfName = fiche.getIPDF().getPrenom() + " " +fiche.getIPDF().getNom();

        String subject = "Fiche d'instruction validée par l'IPDF - " + produitName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche suivante que vous avez ajoutée a été validée par l'IPDF " + ipdfName + ". \n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "\n\n"
                + "La fiche est maintenant en attente de validation de l'IQP. Vous serez informé dès que la fiche sera validée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }
    @Override
    public void notifySuperUserAboutIPDFAcceptence(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String ipdfName =fiche.getIPDF().getPrenom()+ " " + fiche.getIPDF().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();


        String subject = "Fiche d'instruction validée par l'IPDF - " + produitName ;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été validée par l'IPDF " + ipdfName + ". \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "La fiche est maintenant en attente de validation de l'IQP. Vous serez informé dès que la fiche sera validée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    @Override
    public void notifySuperUserAboutIPDFRejection(Fiche fiche, User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String ipdfName = fiche.getIPDF().getPrenom() + " " + fiche.getIPDF().getNom(); // Nom de l'IPDF
        String commentaire = fiche.getCommentaire(); // Raison du rejet (si disponible)


        String subject = "Fiche d'instruction rejetée par l'IPDF - " + produitName ;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été rejetée par l'IPDF " + ipdfName + ". \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "- Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";
        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    @Override
    public void notifyIQPAboutFicheValidationByIPDF(Fiche fiche , User iqp) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String iqpEmail = iqp.getEmail();
        String iqpName = iqp.getPrenom() + " " + iqp.getNom();
        String validatorName = fiche.getActionneur().getNom()+ " "  + fiche.getActionneur().getPrenom();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);
        String subject = "Nouvelle fiche d'instruction à valider - " + produitName;
        String text = "Bonjour " + iqpName + ",\n\n"
                + "La fiche d'instruction suivante a été validée par "+ validatorName + " et nécessite maintenant votre validation. \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n\n"
                + "Vous devez valider cette fiche avant la date d'expiration. Si aucune action n'est effectuée avant cette date, la fiche sera automatiquement marquée comme expirée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(iqpEmail, subject, text);
    }


    // validation iqp
    @Override
    public void notifyPreparateurAboutIQPRejection(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String commentaire = fiche.getCommentaire();
        String rejectedBy = fiche.getActionneur().getPrenom() + " " +fiche.getActionneur().getNom();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);

        String subject = "Fiche d'instruction rejetée - " + produitName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche suivante que vous avez ajoutée a été rejetée par l'IQP " + rejectedBy + ". \n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n"
                + "- Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Vous pouvez consulter la fiche dans l'application pour plus de détails avant la date d'éxpiration et apporter les modifications nécessaires.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }
    @Override
    public void notifyPreparateurAboutIQPAcceptance(Fiche fiche) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String preparateurEmail = fiche.getPreparateur().getEmail();
        String iqpName = fiche.getIQP().getPrenom() + " " +fiche.getIQP().getNom();

        String subject = "Fiche d'instruction validée avec succès - " + produitName;
        String text = "Bonjour " + preparateurName + ",\n\n"
                + "La fiche suivante que vous avez ajoutée a été validée par l'IQP "+ iqpName + "et la fiche AQL a été ajoutée avec succé.\n\nVoici les détails de cette fiche :\n"
                + generateFicheDetails(fiche)
                + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(preparateurEmail, subject, text);
    }
    @Override
    public void notifySuperUserAboutIQPValidation(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String iqpName =fiche.getIQP().getPrenom()+ " " + fiche.getIQP().getNom();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();

        String subject = "Fiche d'instruction validée par l'IQP - " + produitName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été validée par l'IQP " + iqpName + " et la fiche AQL a été ajoutée avec succé. \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }
    @Override
    public void notifySuperUserAboutIQPRejection(Fiche fiche, User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String iqpName =fiche.getIQP().getPrenom()+ " " + fiche.getIQP().getNom();
        String commentaire = fiche.getCommentaire();

        String subject = "Fiche d'instruction rejetée par l'IQP؛ - " + produitName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante a été rejetée par l'IQP " + iqpName + ". \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "- Raison du rejet : " + (commentaire != null ? commentaire : "Aucune raison fournie") + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";
        emailService.sendEmail(superuser.getEmail(), subject, text);
    }


    // expiration
    @Override
    public void notifySuperUserAboutFicheExpiration(Fiche fiche , User superuser) {
        String preparateurName = fiche.getPreparateur().getPrenom() + " " + fiche.getPreparateur().getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String  superuserName = superuser.getPrenom() + " " + superuser.getNom();
        String subject = "Fiche d'instruction expirée - " + produitName;
        String text = "Bonjour " + superuserName + ",\n\n"
                + "La fiche suivante est expirée. \n\nVoici les détails de cette fiche :\n"
                + "- Préparateur : " + preparateurName + "\n"
                + generateFicheDetails(fiche)
                + "\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(superuser.getEmail(), subject, text);
    }

    @Override
    public void sendExpirationReminderForFiche(Fiche fiche, long hoursUntilExpiration , User  user) {
        String userName = user.getPrenom() + " " + user.getNom();
        String produitName = fiche.getProduit().getNomProduit();
        String mail = user.getEmail();
        LocalDateTime expirationDate = fiche.getExpirationDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = expirationDate.format(formatter);

        String subject = "Rappel : Validation nécessaire avant expiration de la fiche - " + produitName;
        String text = "Bonjour " + userName + ",\n\n"
                + "La fiche suivante va expirer si elle n'est pas validée avant la date d'expiration :\n\n"
                + generateFicheDetails(fiche)
                + "- Date d'expiration de validation : " + formattedDate + "\n\n"
                + "Il reste " + hoursUntilExpiration + " heures pour valider cette fiche. Si elle n'est pas validée avant cette date, elle sera automatiquement marquée comme expirée.\n\n"
                + "Cordialement,\n"
                + "L'équipe de gestion des fiches d'instructions\n"
                + "Sagemcom";

        emailService.sendEmail(mail, subject, text);
    }


    private String generateFicheDetails(Fiche fiche) {
        String produitName = fiche.getProduit().getNomProduit();
        String zoneName = "";
        String ligneName = "";
        String operationName = "";
        String indice = fiche.getProduit().getIndice();
        String ref = fiche.getProduit().getRef();

        if (fiche.getTypeFiche().equals("OPERATION")) {
            FicheOperation ficheOperation = (FicheOperation) fiche;
            zoneName = ficheOperation.getOperation().getLigne().getZone().getNom();
            ligneName = ficheOperation.getOperation().getLigne().getNom();
            operationName = ficheOperation.getOperation().getNom();
        } else if (fiche.getTypeFiche().equals("LIGNE")) {
            FicheLigne ficheLigne = (FicheLigne) fiche;
            zoneName = ficheLigne.getLigne().getZone().getNom();
            ligneName = ficheLigne.getLigne().getNom();
            operationName = "tous";
        } else {
            FicheZone ficheZone = (FicheZone) fiche;
            zoneName = ficheZone.getZone().getNom();
            ligneName = "tous";
            operationName = "tous";
        }

        return "- Id de la fiche : " + fiche.getIdFiche() + "\n"
                + "- Nom Produit : " + produitName + "\n"
                + "- Reference Produit : " + ref + "\n"
                + "- Indice Produit : " + indice + "\n"
                + "- Zone : " + zoneName + "\n"
                + "- Ligne : " + ligneName + "\n"
                + "- Operation : " + operationName + "\n";
    }

}
