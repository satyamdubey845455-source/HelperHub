package com.fittrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TargetOverrideRequest {

    @NotNull(message = "Daily calorie target is required")
    @Min(value = 500, message = "Calorie target must be at least 500 kcal")
    @Max(value = 10000, message = "Calorie target must be at most 10000 kcal")
    private Integer dailyCalorieTarget;

    @NotNull(message = "Daily protein target is required")
    @DecimalMin(value = "0.0", message = "Protein target cannot be negative")
    private BigDecimal dailyProteinTarget;

    @NotNull(message = "Daily carb target is required")
    @DecimalMin(value = "0.0", message = "Carb target cannot be negative")
    private BigDecimal dailyCarbTarget;

    @NotNull(message = "Daily fat target is required")
    @DecimalMin(value = "0.0", message = "Fat target cannot be negative")
    private BigDecimal dailyFatTarget;

    @DecimalMin(value = "0.0", message = "Fiber target cannot be negative")
    private BigDecimal dailyFiberTarget;

    @Min(value = 500, message = "Water target must be at least 500 ml")
    @Max(value = 10000, message = "Water target must be at most 10000 ml")
    private Integer dailyWaterTargetMl;

    @DecimalMin(value = "1.0", message = "Sleep target must be at least 1 hour")
    @DecimalMax(value = "14.0", message = "Sleep target must be at most 14 hours")
    private BigDecimal dailySleepTargetHours;
}
