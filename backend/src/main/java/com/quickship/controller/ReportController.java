package com.quickship.controller;

import com.quickship.dto.MultiClientReportRequest;
import com.quickship.dto.ReportStatsResponse;
import com.quickship.entity.ParcelStatus;
import com.quickship.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAuthority('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/stats")
    public ResponseEntity<ReportStatsResponse> getReportStats() {
        return ResponseEntity.ok(reportService.getReportStats());
    }

    @GetMapping("/daily")
    public ResponseEntity<byte[]> getDailyReport() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        byte[] pdf = reportService.generatePdfReport(start, end, null, null, null, null, "Aujourd'hui");
        return createPdfResponse(pdf, "rapport_journalier.pdf");
    }

    @GetMapping("/weekly")
    public ResponseEntity<byte[]> getWeeklyReport() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = LocalDateTime.of(today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)), LocalTime.MAX);
        byte[] pdf = reportService.generatePdfReport(start, end, null, null, null, null, "Cette Semaine");
        return createPdfResponse(pdf, "rapport_hebdomadaire.pdf");
    }

    @GetMapping("/monthly")
    public ResponseEntity<byte[]> getMonthlyReport() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = LocalDateTime.of(today.withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(today.with(TemporalAdjusters.lastDayOfMonth()), LocalTime.MAX);
        byte[] pdf = reportService.generatePdfReport(start, end, null, null, null, null, "Ce Mois");
        return createPdfResponse(pdf, "rapport_mensuel.pdf");
    }

    @GetMapping("/custom")
    public ResponseEntity<byte[]> getCustomReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) List<ParcelStatus> statuses
    ) {
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX) : null;

        String periodLabel = "Personnalisée";
        if (startDate != null && endDate != null) {
            periodLabel = "Du " + startDate + " au " + endDate;
        } else if (startDate != null) {
            periodLabel = "Depuis le " + startDate;
        } else if (endDate != null) {
            periodLabel = "Jusqu'au " + endDate;
        }

        byte[] pdf = reportService.generatePdfReport(start, end, driverId, clientId, null, statuses, periodLabel);
        return createPdfResponse(pdf, "rapport_personnalise.pdf");
    }

    @GetMapping("/by-deliveryman/{id}")
    public ResponseEntity<byte[]> getReportByDeliveryman(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX) : null;
        byte[] pdf = reportService.generatePdfReport(start, end, id, null, null, null, "Filtre Livreur");
        return createPdfResponse(pdf, "rapport_livreur_" + id + ".pdf");
    }

    @GetMapping("/by-client/{id}")
    public ResponseEntity<byte[]> getReportByClient(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        LocalDateTime start = startDate != null ? LocalDateTime.of(startDate, LocalTime.MIN) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.of(endDate, LocalTime.MAX) : null;
        byte[] pdf = reportService.generatePdfReport(start, end, null, id, null, null, "Filtre Client");
        return createPdfResponse(pdf, "rapport_client_" + id + ".pdf");
    }

    @PostMapping("/by-clients")
    public ResponseEntity<byte[]> getReportByClients(@RequestBody MultiClientReportRequest request) {
        LocalDate startD = request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : null;
        LocalDate endD = request.getEndDate() != null ? LocalDate.parse(request.getEndDate()) : null;

        LocalDateTime start = startD != null ? LocalDateTime.of(startD, LocalTime.MIN) : null;
        LocalDateTime end = endD != null ? LocalDateTime.of(endD, LocalTime.MAX) : null;

        String periodLabel = "Multi-Clients";
        if (startD != null && endD != null) {
            periodLabel = "Du " + startD + " au " + endD;
        }

        byte[] pdf = reportService.generatePdfReport(
                start, end, request.getDriverId(), null, request.getClientIds(), request.getStatuses(), periodLabel
        );
        return createPdfResponse(pdf, "rapport_multi_clients.pdf");
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }
}
