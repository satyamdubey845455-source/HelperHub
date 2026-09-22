package com.fittrack.dto.request;

import com.fittrack.entity.UserProfile.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProfileRequest {

    private String fullName;

    @NotNull(message = "Age is required")
    @Min(value = 10, message = "Age must be at least 10")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Height is required")
    @DecimalMin(value = "50.0", message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height must be at most 300 cm")
    private BigDecimal heightCm;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @NotNull(message = "Activity level is required")
    private ActivityLevel activityLevel;

    @NotNull(message = "Fitness goal is required")
    private FitnessGoal fitnessGoal;

    @Min(value = 0, message = "Workout frequency cannot be negative")
    @Max(value = 7, message = "Workout frequency cannot exceed 7 days")
    private Integer workoutFrequency;

    private WorkoutTime preferredWorkoutTime;

    @NotNull(message = "Dietary preference is required")
    private DietaryPreference dietaryPreference;

    private String timezone;
}
