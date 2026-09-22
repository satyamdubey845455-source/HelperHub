package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Complete dashboard summary for a given date */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private LocalDate date;

    // Nutrition totals
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFat;
    private BigDecimal totalFiber;
    private BigDecimal totalSugar;
    private BigDecimal totalAddedSugar;
    private BigDecimal totalSodium;

    // Daily targets (from profile)
    private Integer calorieTarget;
    private BigDecimal proteinTarget;
    private BigDecimal carbTarget;
    private BigDecimal fatTarget;
    private BigDecimal fiberTarget;
    private BigDecimal addedSugarTarget;

    // Sugar tracking status & alerts (Sections 19, 20)
    private String addedSugarStatus; // NORMAL, APPROACHING_LIMIT, EXCEEDED
    private String addedSugarAlert;  // Neutral alert text
    private List<SugarSourceItem> topAddedSugarSources;

    // Water
    private Integer totalWaterMl;
    private Integer waterTargetMl;

    // Workout
    private Boolean workoutCompleted;
    private String workoutName;
    private Integer workoutDurationMinutes;

    // Sleep (for previous night)
    private BigDecimal sleepHours;
    private BigDecimal sleepTarget;
    private String sleepQuality;

    // Body
    private BigDecimal currentWeightKg;

    // Percentage progress (0–100 capped)
    private Double calorieProgress;
    private Double proteinProgress;
    private Double carbProgress;
    private Double fatProgress;
    private Double waterProgress;
    private Double sleepProgress;
    private Double addedSugarProgress;

    // "What should I do today?" Smart Assistant (Section 21)
    private TodayFocus todayFocus;
    private List<String> nextActions;

    // Smart Nutrition & Wellness Alerts (Section 20, 51)
    private List<SmartAlert> smartAlerts;

    // Weekly summary for mini charts
    private List<DayNutritionSummary> weeklyNutrition;
    private List<DayWaterSummary> weeklyWater;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SugarSourceItem {
        private String foodName;
        private BigDecimal grams;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayFocus {
        private String greeting;
        private String scheduledWorkout;
        private String hydrationStatus;
        private String proteinStatus;
        private String calorieStatus;
        private String sleepStatus;
        private String currentGoal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmartAlert {
        private String category; // NUTRITION, HYDRATION, WORKOUT, SLEEP
        private String title;
        private String message;
        private String level;    // INFO, WARNING, SUCCESS
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayNutritionSummary {
        private LocalDate date;
        private BigDecimal calories;
        private BigDecimal protein;
        private BigDecimal carbs;
        private BigDecimal fat;
        private BigDecimal addedSugar;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayWaterSummary {
        private LocalDate date;
        private Integer totalMl;
    }
}
