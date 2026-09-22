package com.fittrack.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BodyMeasurementRequest {

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @DecimalMin(value = "0.0", message = "Measurements cannot be negative")
    private BigDecimal waistCm;

    @DecimalMin(value = "0.0")
    private BigDecimal chestCm;

    @DecimalMin(value = "0.0")
    private BigDecimal armCm;

    @DecimalMin(value = "0.0")
    private BigDecimal thighCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0", message = "Body fat % must be between 0 and 100")
    private BigDecimal bodyFatPct;

    private String notes;
}
