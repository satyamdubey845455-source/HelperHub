package com.fittrack.dto.response;

import com.fittrack.entity.Meal.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealTemplateResponse {
    private Long id;
    private String templateName;
    private MealType mealType;
    private List<TemplateItemResponse> items;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFat;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateItemResponse {
        private Long id;
        private Long foodId;
        private String foodName;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal calories;
        private BigDecimal protein;
        private BigDecimal carbs;
        private BigDecimal fat;
    }
}
