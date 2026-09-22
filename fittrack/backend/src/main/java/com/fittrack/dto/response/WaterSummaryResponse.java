package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaterSummaryResponse {
    private LocalDate date;
    private Integer totalMl;
    private Integer targetMl;
    private Double progressPercentage;
    private List<WaterLogResponse> logs;
}
