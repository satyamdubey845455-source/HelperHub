package com.fittrack.dto.response;

import com.fittrack.entity.UserProfile.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;

    private Integer age;
    private Gender gender;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private ActivityLevel activityLevel;
    private FitnessGoal fitnessGoal;
    private Integer workoutFrequency;
    private WorkoutTime preferredWorkoutTime;
    private DietaryPreference dietaryPreference;

    // Daily targets
    private Integer dailyCalorieTarget;
    private BigDecimal dailyProteinTarget;
    private BigDecimal dailyCarbTarget;
    private BigDecimal dailyFatTarget;
    private BigDecimal dailyFiberTarget;
    private Integer dailyWaterTargetMl;
    private BigDecimal dailySleepTargetHours;
    private BigDecimal dailyAddedSugarTarget;
    private String timezone;
    private Boolean targetsManuallyOverridden;

    private Integer bmr;
    private Integer tdee;

    private LocalDateTime updatedAt;
}
