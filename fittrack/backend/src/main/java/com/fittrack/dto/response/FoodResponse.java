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
public class FoodResponse {
    private Long id;
    private String name;
    private String category;
    private BigDecimal servingSizeG;
    private String servingSizeUnit;
    private BigDecimal caloriesPerServing;
    private BigDecimal proteinG;
    private BigDecimal carbsG;
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
    private String source;
    private Boolean verified;
    private Boolean isCustom;
    private Boolean isFavorite;
    private Long createdByUserId;
}
