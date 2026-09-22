package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "height_cm", precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", length = 25)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_goal", length = 25)
    private FitnessGoal fitnessGoal;

    @Column(name = "workout_frequency")
    private Integer workoutFrequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_workout_time", length = 15)
    private WorkoutTime preferredWorkoutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_preference", length = 20)
    private DietaryPreference dietaryPreference;

    // Daily targets — computed or manually overridden
    @Column(name = "daily_calorie_target")
    private Integer dailyCalorieTarget;

    @Column(name = "daily_protein_target", precision = 6, scale = 2)
    private BigDecimal dailyProteinTarget;

    @Column(name = "daily_carb_target", precision = 6, scale = 2)
    private BigDecimal dailyCarbTarget;

    @Column(name = "daily_fat_target", precision = 6, scale = 2)
    private BigDecimal dailyFatTarget;

    @Column(name = "daily_fiber_target", precision = 6, scale = 2)
    private BigDecimal dailyFiberTarget;

    @Column(name = "daily_water_target_ml")
    private Integer dailyWaterTargetMl;

    @Column(name = "daily_sleep_target_hours", precision = 4, scale = 2)
    private BigDecimal dailySleepTargetHours;

    @Column(name = "daily_added_sugar_target_g", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal dailyAddedSugarTarget = BigDecimal.valueOf(25);

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(name = "targets_manually_overridden")
    @Builder.Default
    private Boolean targetsManuallyOverridden = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Enums ──────────────────────────────────────────────────────────────

    public enum Gender {
        MALE, FEMALE, OTHER;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static Gender fromString(String val) {
            if (val == null) return null;
            val = val.trim().toUpperCase();
            try {
                return Gender.valueOf(val);
            } catch (IllegalArgumentException e) {
                return OTHER;
            }
        }
    }

    public enum ActivityLevel {
        SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static ActivityLevel fromString(String val) {
            if (val == null) return null;
            val = val.trim().toUpperCase();
            try {
                return ActivityLevel.valueOf(val);
            } catch (IllegalArgumentException e) {
                return MODERATELY_ACTIVE;
            }
        }
    }

    public enum FitnessGoal {
        MUSCLE_GAIN, FAT_LOSS, MAINTENANCE, GENERAL_FITNESS, STRENGTH;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static FitnessGoal fromString(String val) {
            if (val == null) return null;
            val = val.trim().toUpperCase();
            return switch (val) {
                case "BUILD_MUSCLE", "HYPERTROPHY" -> MUSCLE_GAIN;
                case "LOSE_WEIGHT", "CUT", "WEIGHT_LOSS" -> FAT_LOSS;
                case "MAINTAIN_WEIGHT", "RECOMP" -> MAINTENANCE;
                case "IMPROVE_ENDURANCE", "ENDURANCE" -> GENERAL_FITNESS;
                default -> {
                    try {
                        yield FitnessGoal.valueOf(val);
                    } catch (IllegalArgumentException e) {
                        yield GENERAL_FITNESS;
                    }
                }
            };
        }
    }

    public enum WorkoutTime {
        MORNING, AFTERNOON, EVENING, NIGHT;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static WorkoutTime fromString(String val) {
            if (val == null) return null;
            val = val.trim().toUpperCase();
            try {
                return WorkoutTime.valueOf(val);
            } catch (IllegalArgumentException e) {
                return EVENING;
            }
        }
    }

    public enum DietaryPreference {
        VEGETARIAN, EGGETARIAN, NON_VEGETARIAN, VEGAN, KETO;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static DietaryPreference fromString(String val) {
            if (val == null) return null;
            val = val.trim().toUpperCase();
            try {
                return DietaryPreference.valueOf(val);
            } catch (IllegalArgumentException e) {
                return NON_VEGETARIAN;
            }
        }
    }
}
