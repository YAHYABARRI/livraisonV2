package com.quickship.dto;

import com.quickship.entity.ParcelStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String startDate; // format: yyyy-MM-dd
    private String endDate;   // format: yyyy-MM-dd
    private Long driverId;
    private Long clientId;
    private List<ParcelStatus> statuses;
}
