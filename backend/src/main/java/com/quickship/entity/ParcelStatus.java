package com.quickship.entity;

public enum ParcelStatus {
    CREATED,           // Créé
    ACCEPTED,          // Accepté / Assigné
    PICKED_UP,         // Collecté / Récupéré
    IN_TRANSIT,        // En transit
    ARRIVED_AT_HUB,    // Arrivé au centre de tri
    OUT_FOR_DELIVERY,  // En cours de livraison
    DELIVERED,         // Livré
    RETURNED           // Retourné
}
