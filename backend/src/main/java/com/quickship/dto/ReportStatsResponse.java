package com.quickship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatsResponse {
    private double revenueToday;
    private double revenueMonth;
    private long deliveredCount;
    private long pendingCount;
    private long returnedCount;
}
