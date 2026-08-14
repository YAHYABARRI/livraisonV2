package com.quickship.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotBlank(message = "Le statut est requis")
    private String status; // WAITING_PICKUP, PICKED_UP, IN_EXPEDITION, SECOND_CALL, UNREACHABLE, REFUSED, RETURN_TO_CLIENT, RETURN_TO_STOCK, DELIVERED

    private String description;
}
