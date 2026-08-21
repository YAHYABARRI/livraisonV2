package com.quickship.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class DeliveryRateOrderRequest {
    @NotEmpty(message = "La liste des villes est obligatoire")
    private List<@NotNull Long> rateIds;
}
