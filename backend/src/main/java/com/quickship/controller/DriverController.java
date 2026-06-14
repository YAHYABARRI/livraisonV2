package com.quickship.controller;

import com.quickship.dto.ParcelResponse;
import com.quickship.dto.StatusUpdateRequest;
import com.quickship.security.UserPrincipal;
import com.quickship.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping("/parcels")
    public ResponseEntity<List<ParcelResponse>> getMyAssignedParcels(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(driverService.getAssignedParcels(userPrincipal.getEmail()));
    }

    @PutMapping("/parcels/{id}/status")
    public ResponseEntity<ParcelResponse> updateParcelStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(driverService.updateParcelStatus(id, request, userPrincipal.getEmail()));
    }
}
