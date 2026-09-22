package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private String period; // "7d", "30d", "90d"
    private LocalDate startDate;
    private LocalDate endDate;

    // Averages
    private Double avgDailyCalories;
    private Double avgDailyProteinG;
    private Double avgDailyWaterMl;
    private Double avgDailySleepHours;
    private Integer totalWorkoutsCompleted;
    private Double totalWorkoutVolumeKg;

    // Consistency percentages (days target met / total days)
    private Double calorieConsistencyPct;
    private Double proteinConsistencyPct;
    private Double waterConsistencyPct;
    private Double workoutConsistencyPct;

    // Trends
    private List<DailyMetricPoint> dailyTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMetricPoint {
        private LocalDate date;
        private BigDecimal calories;
        private BigDecimal protein;
        private BigDecimal carbs;
        private BigDecimal fat;
        private BigDecimal addedSugar;
        private Integer waterMl;
        private BigDecimal sleepHours;
        private Boolean workoutCompleted;
        private BigDecimal weightKg;
    }
}
