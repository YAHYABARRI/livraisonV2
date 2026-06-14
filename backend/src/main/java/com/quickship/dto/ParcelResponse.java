package com.quickship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParcelResponse {
    private Long id;
    private String trackingNumber;
    private String trackingId;
    private Double shippingPrice;
    private String parcelType;
    private String recipientName;
    private String recipientPhone;
    private String pickupAddress;
    private String deliveryAddress;
    private String description;
    private Double weight;
    private String status;
    private LocalDateTime estimatedDelivery;
    private UserResponse client;
    private UserResponse driver;
    private List<DeliveryLogResponse> logs;
    private LocalDateTime createdAt;
}
