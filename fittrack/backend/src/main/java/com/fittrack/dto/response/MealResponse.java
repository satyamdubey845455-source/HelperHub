package com.fittrack.dto.response;

import com.fittrack.entity.Meal.MealType;
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
public class MealResponse {
    private Long id;
    private LocalDate logDate;
    private MealType mealType;
    private String notes;
    private List<MealItemResponse> items;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFat;
    private BigDecimal totalFiber;
    private BigDecimal totalSugar;
    private BigDecimal totalAddedSugar;
    private BigDecimal totalSodium;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealItemResponse {
        private Long id;
        private Long foodId;
        private String foodName;
        private String servingSizeUnit;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal caloriesConsumed;
        private BigDecimal proteinConsumed;
        private BigDecimal carbsConsumed;
        private BigDecimal fatConsumed;
        private BigDecimal fiberConsumed;
        private BigDecimal sugarConsumed;
        private BigDecimal addedSugarConsumed;
        private BigDecimal sodiumConsumed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyNutritionTotals {
        private LocalDate date;
        private BigDecimal totalCalories;
        private BigDecimal totalProtein;
        private BigDecimal totalCarbs;
        private BigDecimal totalFat;
        private BigDecimal totalFiber;
        private BigDecimal totalSugar;
        private BigDecimal totalAddedSugar;
        private BigDecimal totalSodium;
    }
}
