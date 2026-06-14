package com.quickship.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignDriverRequest {

    @NotNull(message = "L'ID du colis est requis")
    private Long parcelId;

    @NotNull(message = "L'ID du livreur est requis")
    private Long driverId;
}
