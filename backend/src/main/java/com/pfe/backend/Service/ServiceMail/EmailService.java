package com.pfe.backend.Service.ServiceMail;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
