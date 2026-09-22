package com.fittrack.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodRequest {

    @NotBlank(message = "Food name is required")
    private String name;

    private String category;

    @DecimalMin(value = "0.0", message = "Serving size must be positive")
    private BigDecimal servingSizeG;

    private String servingSizeUnit;

    @NotNull(message = "Calories per serving is required")
    @DecimalMin(value = "0.0", message = "Calories must be positive")
    private BigDecimal caloriesPerServing;

    @NotNull(message = "Protein is required")
    @DecimalMin(value = "0.0", message = "Protein must be positive")
    private BigDecimal proteinG;

    @NotNull(message = "Carbs is required")
    @DecimalMin(value = "0.0", message = "Carbs must be positive")
    private BigDecimal carbsG;

    @NotNull(message = "Fat is required")
    @DecimalMin(value = "0.0", message = "Fat must be positive")
    private BigDecimal fatG;

    private BigDecimal fiberG;
    private BigDecimal sugarG;
    private BigDecimal addedSugarG;
    private BigDecimal saturatedFatG;
    private BigDecimal sodiumMg;
    private BigDecimal cholesterolMg;
    private BigDecimal calciumMg;
    private BigDecimal ironMg;
    private BigDecimal vitaminDMicrog;
    private BigDecimal vitaminB12Microg;
}
