package com.quickship.entity;

public enum ParcelStatus {
    DELIVERED,          // Livré
    IN_EXPEDITION,      // En cours d'expédition
    SECOND_CALL,        // 2ème appel
    UNREACHABLE,        // Injoignable
    REFUSED,            // Refusé
    RETURN_TO_CLIENT,   // Retour au client
    RETURN_TO_STOCK,    // Retour au stock
    PICKED_UP,          // Ramassé
    WAITING_PICKUP      // En attente de ramassage
}
