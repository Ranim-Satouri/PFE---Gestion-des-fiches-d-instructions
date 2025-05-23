package com.pfe.backend.configuration;

import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.event.spi.PostDeleteEvent;
import org.hibernate.event.spi.PostDeleteEventListener;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.pfe.backend.Model.UserZone;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;

@Configuration
public class EnversConfig {
    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @PostConstruct
    public void registerListeners() {
        SessionFactoryImpl sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);
        EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
        registry.getEventListenerGroup(EventType.POST_DELETE).appendListener(new PostDeleteEventListener() {
            @Override
            public void onPostDelete(PostDeleteEvent event) {
                if (event.getEntity() instanceof UserZone) {
                    UserZone uz = (UserZone) event.getEntity();
                    System.out.println("Envers Delete: UserZoneId=" + uz.getId() +
                            ", UserId=" + (uz.getUser() != null ? uz.getUser().getIdUser() : "null") +
                            ", ZoneId=" + (uz.getZone() != null ? uz.getZone().getIdZone() : "null") +
                            ", IdActionneur=" + uz.getIdActionneur());
                }
            }

            @Override
            public boolean requiresPostCommitHandling(org.hibernate.persister.entity.EntityPersister persister) {
                return false;
            }
        });
    }
}