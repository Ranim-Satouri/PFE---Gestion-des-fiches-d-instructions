package com.pfe.backend.Service;

import com.pfe.backend.Model.Fiche;

public interface NotificationService {
    void notifyIPDFAboutFicheInjection(Fiche fiche);
}
