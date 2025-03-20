package com.pfe.backend.ServiceMail;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
