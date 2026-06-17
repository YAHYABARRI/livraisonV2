package com.quickship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRateResponse {
    private Long id;
    private String city;
    private Double deliveryFee;
    private Double returnFee;
}
