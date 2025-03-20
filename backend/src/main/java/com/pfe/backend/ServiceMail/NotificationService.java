package com.pfe.backend.ServiceMail;

import com.pfe.backend.Model.Fiche;
import com.pfe.backend.Model.User;

public interface NotificationService {
    void notifyIPDFAboutFicheInjection(Fiche fiche);
    void notifyIQPAboutFicheValidationByIPDF(Fiche fiche);
    void notifyPreparateurAboutIPDFRejection(Fiche fiche);
    void notifySuperUserAboutFicheExpiration(Fiche fiche , User superuser);
    void notifyPreparateurAboutFicheFinalValidation(Fiche fiche);
    void notifyPreparateurAboutIPDFAcceptance(Fiche fiche);
    void notifySuperUserAboutNewFiche(Fiche fiche , User superuser);
    void notifySuperUserAboutIPDFValidation(Fiche fiche , User superuser);
    void notifySuperUserAboutAQLAddition(Fiche fiche , User superuser);
    void notifySuperUserAboutIPDFRejection(Fiche fiche, User superuser);
}
