package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSessionResponse {
    private Long id;
    private LocalDate sessionDate;
    private String name;
    private String notes;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer totalSets;
    private BigDecimal totalVolumeKg;
    @Builder.Default
    private List<WorkoutSetResponse> sets = new ArrayList<>();
}
