package com.quickship.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketSelectionRequest {
    @NotEmpty(message = "Sélectionnez au moins une commande")
    private List<Long> parcelIds;
}
