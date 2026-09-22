package com.fittrack.dto.request;

import com.fittrack.entity.Meal.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class MealTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String templateName;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotEmpty(message = "Template must have at least one food item")
    private List<TemplateItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateItemRequest {
        @NotNull(message = "Food ID is required")
        private Long foodId;

        @NotNull(message = "Quantity is required")
        private BigDecimal quantity;

        private String unit;
    }
}
