package com.quickship.controller;

import com.quickship.dto.DeliveryRateRequest;
import com.quickship.dto.DeliveryRateResponse;
import com.quickship.service.DeliveryRateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DeliveryRateController {

    @Autowired
    private DeliveryRateService deliveryRateService;

    @GetMapping("/api/rates")
    public ResponseEntity<List<DeliveryRateResponse>> getAllRates() {
        return ResponseEntity.ok(deliveryRateService.getAllRates());
    }

    @PostMapping("/api/admin/rates")
    public ResponseEntity<DeliveryRateResponse> createRate(@Valid @RequestBody DeliveryRateRequest request) {
        return ResponseEntity.ok(deliveryRateService.createRate(request));
    }

    @PutMapping("/api/admin/rates/{id}")
    public ResponseEntity<DeliveryRateResponse> updateRate(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryRateRequest request
    ) {
        return ResponseEntity.ok(deliveryRateService.updateRate(id, request));
    }

    @DeleteMapping("/api/admin/rates/{id}")
    public ResponseEntity<Void> deleteRate(@PathVariable Long id) {
        deliveryRateService.deleteRate(id);
        return ResponseEntity.noContent().build();
    }
}
