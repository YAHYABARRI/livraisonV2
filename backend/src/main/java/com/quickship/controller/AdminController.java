package com.quickship.controller;

import com.quickship.dto.AssignDriverRequest;
import com.quickship.dto.DashboardStatsResponse;
import com.quickship.dto.ParcelResponse;
import com.quickship.dto.UserResponse;
import com.quickship.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page == null || size == null) {
            return ResponseEntity.ok(adminService.getAllUsers());
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").ascending());
        return ResponseEntity.ok(adminService.getAllUsersPaginated(search, pageable));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<UserResponse>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @GetMapping("/parcels")
    public ResponseEntity<?> getAllParcels(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page == null || size == null) {
            return ResponseEntity.ok(adminService.getAllParcels());
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.getAllParcelsPaginated(search, pageable));
    }

    @PostMapping("/assign-driver")
    public ResponseEntity<ParcelResponse> assignDriver(@Valid @RequestBody AssignDriverRequest request) {
        return ResponseEntity.ok(adminService.assignDriver(request.getParcelId(), request.getDriverId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
