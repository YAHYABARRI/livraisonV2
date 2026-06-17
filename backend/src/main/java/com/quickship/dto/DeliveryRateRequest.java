package com.quickship.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRateRequest {

    @NotBlank(message = "La ville est obligatoire")
    private String city;

    @NotNull(message = "Le prix de livraison est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix de livraison doit etre positif")
    private Double deliveryFee;

    @DecimalMin(value = "0.0", message = "Le prix de retour doit etre positif ou nul")
    private Double returnFee;
}
