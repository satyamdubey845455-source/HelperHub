package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementResponse {
    private Long id;
    private LocalDate logDate;
    private BigDecimal weightKg;
    private BigDecimal waistCm;
    private BigDecimal chestCm;
    private BigDecimal armCm;
    private BigDecimal thighCm;
    private BigDecimal bodyFatPct;
    private String notes;
}
