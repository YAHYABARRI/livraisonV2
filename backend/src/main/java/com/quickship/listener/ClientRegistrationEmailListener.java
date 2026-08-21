package com.quickship.listener;

import com.quickship.event.ClientRegisteredEvent;
import com.quickship.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ClientRegistrationEmailListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClientRegistrationEmailListener.class);

    private final EmailService emailService;

    public ClientRegistrationEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onClientRegistered(ClientRegisteredEvent event) {
        try {
            emailService.sendNewClientRegistrationNotification(event);
        } catch (Exception exception) {
            LOGGER.error(
                    "Impossible d'envoyer la notification d'inscription pour l'utilisateur {}. L'inscription reste enregistrée.",
                    event.userId(),
                    exception
            );
        }
    }
}
