package com.quickship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalClients;
    private long totalDrivers;
    private long totalParcels;
    private long parcelsToday;
    private long pendingParcels;
    private long activeParcels;
    private long deliveredParcels;
    private double simulatedRevenue;
}
