package com.fittrack.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutScheduleRequest {
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;
    private String routineName;
    private String targetMuscleGroups;
    private Boolean isRestDay;
    private String notes;
}
