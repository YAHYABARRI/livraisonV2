package com.quickship.service;

import com.quickship.event.ClientRegisteredEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    private static final String REGISTRATION_SUBJECT = "Nouvelle inscription client";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final RestClient resendClient;
    private final String apiKey;
    private final String senderAddress;
    private final String registrationRecipient;

    public EmailService(
            RestClient.Builder restClientBuilder,
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String senderAddress,
            @Value("${app.notifications.registration-recipient:}") String registrationRecipient) {
        this.resendClient = restClientBuilder.baseUrl("https://api.resend.com").build();
        this.apiKey = apiKey;
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
        if (!StringUtils.hasText(apiKey) || !StringUtils.hasText(senderAddress) || !StringUtils.hasText(recipient)) {
            throw new IllegalStateException("La configuration email est incomplète");
        }

        ResendEmailRequest request = new ResendEmailRequest(
                "GLADEX DELIVERY <" + senderAddress + ">",
                List.of(recipient),
                subject,
                body
        );

        resendClient.post()
                .uri("/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    private record ResendEmailRequest(String from, List<String> to, String subject, String text) {
    }
}
