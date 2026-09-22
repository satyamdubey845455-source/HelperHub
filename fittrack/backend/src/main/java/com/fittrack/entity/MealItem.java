package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "meal_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    /** Number of servings */
    @Column(name = "quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit", length = 20)
    private String unit;

    // Computed nutrition (quantity × food nutrition per serving)
    @Column(name = "calories_consumed", precision = 8, scale = 2)
    private BigDecimal caloriesConsumed;

    @Column(name = "protein_consumed", precision = 6, scale = 2)
    private BigDecimal proteinConsumed;

    @Column(name = "carbs_consumed", precision = 6, scale = 2)
    private BigDecimal carbsConsumed;

    @Column(name = "fat_consumed", precision = 6, scale = 2)
    private BigDecimal fatConsumed;

    @Column(name = "fiber_consumed", precision = 6, scale = 2)
    private BigDecimal fiberConsumed;

    @Column(name = "sugar_consumed", precision = 6, scale = 2)
    private BigDecimal sugarConsumed;

    @Column(name = "added_sugar_consumed", precision = 6, scale = 2)
    private BigDecimal addedSugarConsumed;

    @Column(name = "sodium_consumed", precision = 8, scale = 2)
    private BigDecimal sodiumConsumed;

    /** Calculate and set all consumed nutrition based on serving multiplier */
    public void computeNutrition() {
        if (food == null || quantity == null) return;
        BigDecimal multiplier = calculateServingMultiplier();

        caloriesConsumed   = safeMultiply(food.getCaloriesPerServing(), multiplier);
        proteinConsumed    = safeMultiply(food.getProteinG(), multiplier);
        carbsConsumed      = safeMultiply(food.getCarbsG(), multiplier);
        fatConsumed        = safeMultiply(food.getFatG(), multiplier);
        fiberConsumed      = safeMultiply(food.getFiberG(), multiplier);
        sugarConsumed      = safeMultiply(food.getSugarG(), multiplier);
        addedSugarConsumed = safeMultiply(food.getAddedSugarG(), multiplier);
        sodiumConsumed     = safeMultiply(food.getSodiumMg(), multiplier);
    }

    private BigDecimal calculateServingMultiplier() {
        if (quantity == null) return BigDecimal.ONE;

        // If unit is grams or ml and food serving is in grams/ml with servingSizeG defined
        String foodUnit = food.getServingSizeUnit() != null ? food.getServingSizeUnit().toLowerCase() : "g";
        String itemUnit = unit != null ? unit.toLowerCase() : foodUnit;

        if (("g".equals(itemUnit) || "grams".equals(itemUnit) || "ml".equals(itemUnit))
                && food.getServingSizeG() != null && food.getServingSizeG().compareTo(BigDecimal.ZERO) > 0) {
            return quantity.divide(food.getServingSizeG(), 4, java.math.RoundingMode.HALF_UP);
        }

        // Count-based units or standard serving counts (e.g. 1 piece, 2 rotis, 1 scoop, 1.5 servings)
        return quantity;
    }

    private BigDecimal safeMultiply(BigDecimal value, BigDecimal multiplier) {
        if (value == null) return BigDecimal.ZERO;
        return value.multiply(multiplier).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
