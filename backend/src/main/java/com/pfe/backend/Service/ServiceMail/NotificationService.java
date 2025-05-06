package com.pfe.backend.Service.ServiceMail;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.User;

public interface NotificationService {
    void notifyIPDFAboutFicheInjection(Fiche fiche , User ipdf);
    void notifyIQPAboutFicheValidationByIPDF(Fiche fiche , User user);
    void notifyPreparateurAboutIPDFRejection(Fiche fiche);
    void notifyPreparateurAboutIQPRejection(Fiche fiche);
    void notifySuperUserAboutFicheExpiration(Fiche fiche , User superuser);
    void notifyPreparateurAboutIQPAcceptance(Fiche fiche);
    void notifyPreparateurAboutIPDFAcceptance(Fiche fiche);
    void notifySuperUserAboutNewFiche(Fiche fiche , User superuser);
    void notifySuperUserAboutIPDFAcceptence(Fiche fiche , User superuser);
    //void notifySuperUserAboutAQLAddition(Fiche fiche , User superuser);
    void notifySuperUserAboutIPDFRejection(Fiche fiche, User superuser);
    void notifySuperUserAboutIQPValidation(Fiche fiche, User superuser);
    void notifySuperUserAboutIQPRejection(Fiche fiche, User superuser);
    void sendExpirationReminderForFiche(Fiche fiche, long hoursUntilExpiration , User user);
}
