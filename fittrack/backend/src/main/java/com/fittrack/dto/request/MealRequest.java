package com.fittrack.dto.request;

import com.fittrack.entity.Meal.MealType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MealRequest {

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;
}
