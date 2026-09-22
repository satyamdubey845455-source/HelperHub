package com.fittrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WorkoutSessionRequest {

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @NotBlank(message = "Session name is required")
    @Size(max = 150)
    private String name;

    private String notes;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration cannot exceed 600 minutes")
    private Integer durationMinutes;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}
