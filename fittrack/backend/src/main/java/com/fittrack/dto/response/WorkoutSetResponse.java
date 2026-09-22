package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSetResponse {
    private Long id;
    private Long sessionId;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private Integer setNumber;
    private Integer reps;
    private BigDecimal weightKg;
    private Integer durationSeconds;
    private Integer restSeconds;
    private Boolean isPr;
    private BigDecimal estimated1RM;
    private BigDecimal volumeKg;
    private String notes;
}
