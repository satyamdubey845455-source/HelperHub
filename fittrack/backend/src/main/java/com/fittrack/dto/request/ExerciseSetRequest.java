package com.fittrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExerciseSetRequest {

    @NotNull(message = "Exercise ID is required")
    private Long exerciseId;

    @NotNull(message = "Set number is required")
    @Min(value = 1, message = "Set number must be at least 1")
    private Integer setNumber;

    @Min(value = 0, message = "Reps cannot be negative")
    @Max(value = 999, message = "Reps cannot exceed 999")
    private Integer reps;

    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    private BigDecimal weightKg;

    @Min(value = 0, message = "Duration cannot be negative")
    private Integer durationSeconds;

    @Min(value = 0, message = "Rest time cannot be negative")
    private Integer restSeconds;

    private String notes;
}
