package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutScheduleResponse {
    private Long id;
    private DayOfWeek dayOfWeek;
    private String routineName;
    private String targetMuscleGroups;
    private Boolean isRestDay;
    private String notes;
}
