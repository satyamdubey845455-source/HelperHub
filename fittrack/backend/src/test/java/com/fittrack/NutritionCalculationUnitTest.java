package com.fittrack;

import com.fittrack.entity.Food;
import com.fittrack.entity.MealItem;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NutritionCalculationUnitTest {

    @Test
    void testStandard100gFoodQuantityScaling() {
        // Paneer: 265 kcal per 100g, 18.3g protein
        Food paneer = Food.builder()
                .name("Paneer")
                .servingSizeG(BigDecimal.valueOf(100))
                .servingSizeUnit("g")
                .caloriesPerServing(BigDecimal.valueOf(265))
                .proteinG(BigDecimal.valueOf(18.3))
                .carbsG(BigDecimal.valueOf(3.4))
                .fatG(BigDecimal.valueOf(20.8))
                .fiberG(BigDecimal.ZERO)
                .sugarG(BigDecimal.valueOf(3.4))
                .addedSugarG(BigDecimal.ZERO)
                .sodiumMg(BigDecimal.valueOf(52))
                .build();

        // User consumes 150g
        MealItem item = MealItem.builder()
                .food(paneer)
                .quantity(BigDecimal.valueOf(150))
                .unit("g")
                .build();

        item.computeNutrition();

        // 1.5 * 265 = 397.50 kcal
        assertEquals(new BigDecimal("397.50"), item.getCaloriesConsumed());
        // 1.5 * 18.3 = 27.45 g protein
        assertEquals(new BigDecimal("27.45"), item.getProteinConsumed());
        // Added sugar should be 0.00
        assertEquals(new BigDecimal("0.00"), item.getAddedSugarConsumed());
    }

    @Test
    void testUnitBasedFoodQuantityCalculation() {
        // Whole wheat roti: 1 piece (35g) has 101 kcal, 3.0g protein
        Food roti = Food.builder()
                .name("Roti")
                .servingSizeG(BigDecimal.valueOf(35))
                .servingSizeUnit("piece")
                .caloriesPerServing(BigDecimal.valueOf(101))
                .proteinG(BigDecimal.valueOf(3.0))
                .carbsG(BigDecimal.valueOf(18.0))
                .fatG(BigDecimal.valueOf(2.4))
                .build();

        // User eats 3 rotis
        MealItem item = MealItem.builder()
                .food(roti)
                .quantity(BigDecimal.valueOf(3))
                .unit("piece")
                .build();

        item.computeNutrition();

        assertEquals(new BigDecimal("303.00"), item.getCaloriesConsumed());
        assertEquals(new BigDecimal("9.00"), item.getProteinConsumed());
    }
}
