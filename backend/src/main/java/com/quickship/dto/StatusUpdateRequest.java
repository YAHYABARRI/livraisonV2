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
    private String status; // ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED

    private String description;
}
