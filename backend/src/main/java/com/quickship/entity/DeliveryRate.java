package com.quickship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_rates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String city;

    @Column(name = "delivery_fee", nullable = false)
    private Double deliveryFee;

    @Column(name = "return_fee", nullable = false)
    @Builder.Default
    private Double returnFee = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (returnFee == null) {
            returnFee = 0.0;
        }
    }
}
