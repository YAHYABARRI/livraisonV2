package com.quickship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parcels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 50)
    private String trackingNumber;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    @Column(name = "pickup_address", nullable = false, length = 255)
    private String pickupAddress;

    @Column(name = "delivery_address", nullable = false, length = 255)
    private String deliveryAddress;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ParcelStatus status = ParcelStatus.CREATED;

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;

    @Column(name = "tracking_id", nullable = false, unique = true, length = 100)
    private String trackingId;

    @Column(name = "shipping_price")
    private Double shippingPrice;

    @Column(name = "parcel_type", length = 50)
    private String parcelType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    @OneToMany(mappedBy = "parcel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DeliveryLog> logs = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (trackingId == null || trackingId.isEmpty()) {
            trackingId = generateTrackingId();
        }
        if (trackingNumber == null || trackingNumber.isEmpty()) {
            trackingNumber = trackingId;
        }
        if (shippingPrice == null) {
            shippingPrice = 15.0 + (weight != null ? weight * 2.5 : 0.0);
        }
        if (parcelType == null) {
            parcelType = determineParcelType(weight);
        }
    }

    private String generateTrackingId() {
        int year = LocalDateTime.now().getYear();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(15);
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 15; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return "QS-" + year + "-" + sb.toString();
    }

    private String determineParcelType(Double w) {
        if (w == null) return "Colis Standard";
        if (w <= 1.0) return "Enveloppe";
        if (w <= 5.0) return "Petit Colis";
        if (w <= 10.0) return "Colis Moyen";
        return "Grand Colis";
    }
}
