package com.quickship.service;

import com.quickship.event.ClientRegisteredEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final String REGISTRATION_SUBJECT = "Nouvelle inscription client";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JavaMailSender mailSender;
    private final String senderAddress;
    private final String registrationRecipient;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String senderAddress,
            @Value("${app.notifications.registration-recipient:}") String registrationRecipient) {
        this.mailSender = mailSender;
        this.senderAddress = senderAddress;
        this.registrationRecipient = registrationRecipient;
    }

    public void sendNewClientRegistrationNotification(ClientRegisteredEvent client) {
        String phone = StringUtils.hasText(client.phone()) ? client.phone() : "Non renseigné";
        String registeredAt = client.registeredAt() != null
                ? client.registeredAt().format(DATE_FORMAT)
                : "Non renseignée";

        String body = String.format(
                "Une nouvelle inscription client a été enregistrée.%n%n" +
                        "Nom : %s%n" +
                        "Prénom : %s%n" +
                        "Email : %s%n" +
                        "Numéro de téléphone : %s%n" +
                        "Date d'inscription : %s%n",
                client.lastName(),
                client.firstName(),
                client.email(),
                phone,
                registeredAt
        );

        sendSimpleEmail(registrationRecipient, REGISTRATION_SUBJECT, body);
    }

    public void sendSimpleEmail(String recipient, String subject, String body) {
        if (!StringUtils.hasText(senderAddress) || !StringUtils.hasText(recipient)) {
            throw new IllegalStateException("La configuration email est incomplète");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
