package com.fittrack.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WaterLogRequest {

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Water amount must be at least 1 ml")
    @Max(value = 5000, message = "Water amount cannot exceed 5000 ml per entry")
    private Integer amountMl;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
