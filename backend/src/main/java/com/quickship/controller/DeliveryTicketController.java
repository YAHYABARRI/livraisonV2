package com.quickship.controller;

import com.quickship.dto.TicketSelectionRequest;
import com.quickship.security.UserPrincipal;
import com.quickship.service.DeliveryTicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/tickets")
@PreAuthorize("hasAnyAuthority('ADMIN', 'CLIENT')")
public class DeliveryTicketController {

    @Autowired
    private DeliveryTicketService deliveryTicketService;

    @PostMapping("/selected")
    public ResponseEntity<byte[]> generateSelectedTickets(
            @Valid @RequestBody TicketSelectionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        byte[] pdf = deliveryTicketService.generateTicketsByIds(request.getParcelIds(), userPrincipal);
        return createPdfResponse(pdf, "tickets_selection.pdf");
    }

    @GetMapping("/day")
    public ResponseEntity<byte[]> generateDailyTickets(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        byte[] pdf = deliveryTicketService.generateTicketsByDate(date, userPrincipal);
        return createPdfResponse(pdf, "tickets_" + date + ".pdf");
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
