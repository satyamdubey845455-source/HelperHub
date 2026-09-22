package com.fittrack.utils;

import com.fittrack.entity.UserProfile;
import com.fittrack.entity.UserProfile.*;
import lombok.experimental.UtilityClass;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates estimated daily calorie and macro targets using:
 *  - Mifflin-St Jeor BMR formula
 *  - TDEE activity multipliers
 *  - Goal-based calorie adjustments
 *  - Goal-based macro splits
 *
 * IMPORTANT: These are statistical estimates, NOT medical prescriptions.
 * All values must be clearly labeled as estimates in the UI.
 */
@UtilityClass
public class TargetCalculatorUtil {

    // ── BMR ────────────────────────────────────────────────────────────────

    /**
     * Mifflin-St Jeor BMR.
     * Male:   10*w + 6.25*h - 5*a + 5
     * Female: 10*w + 6.25*h - 5*a - 161
     */
    public static double calculateBmr(double weightKg, double heightCm, int age, Gender gender) {
        double base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
        return gender == Gender.MALE ? base + 5 : base - 161;
    }

    // ── TDEE ───────────────────────────────────────────────────────────────

    public static double calculateTdee(double bmr, ActivityLevel activityLevel) {
        double multiplier = switch (activityLevel) {
            case SEDENTARY         -> 1.2;
            case LIGHTLY_ACTIVE    -> 1.375;
            case MODERATELY_ACTIVE -> 1.55;
            case VERY_ACTIVE       -> 1.725;
            case EXTRA_ACTIVE      -> 1.9;
        };
        return bmr * multiplier;
    }

    // ── Goal adjustment ────────────────────────────────────────────────────

    public static int calculateDailyCalorieTarget(double tdee, FitnessGoal goal) {
        double adjusted = switch (goal) {
            case MUSCLE_GAIN     -> tdee + 300;
            case FAT_LOSS        -> tdee - 500;
            case STRENGTH        -> tdee + 200;
            case MAINTENANCE,
                 GENERAL_FITNESS -> tdee;
        };
        return (int) Math.round(adjusted);
    }

    // ── Macro targets ──────────────────────────────────────────────────────

    /**
     * Returns protein in grams based on weight and goal.
     */
    public static BigDecimal calculateProteinTarget(double weightKg, FitnessGoal goal) {
        double gPerKg = switch (goal) {
            case MUSCLE_GAIN, STRENGTH -> 2.0;
            case FAT_LOSS              -> 2.2;
            case MAINTENANCE,
                 GENERAL_FITNESS       -> 1.6;
        };
        return round(weightKg * gPerKg);
    }

    /**
     * Carbs from remaining calories after protein and fat are accounted for.
     * Uses a percentage of total calories.
     */
    public static BigDecimal calculateCarbTarget(int totalCalories, FitnessGoal goal) {
        double pct = switch (goal) {
            case MUSCLE_GAIN, MAINTENANCE, GENERAL_FITNESS -> 0.45;
            case FAT_LOSS  -> 0.35;
            case STRENGTH  -> 0.42;
        };
        return round((totalCalories * pct) / 4.0); // 4 kcal per gram of carbs
    }

    /**
     * Fat from a percentage of total calories.
     */
    public static BigDecimal calculateFatTarget(int totalCalories, FitnessGoal goal) {
        double pct = switch (goal) {
            case MUSCLE_GAIN, STRENGTH -> 0.25;
            case FAT_LOSS              -> 0.30;
            case MAINTENANCE,
                 GENERAL_FITNESS       -> 0.28;
        };
        return round((totalCalories * pct) / 9.0); // 9 kcal per gram of fat
    }

    /**
     * Fiber: 14g per 1000 kcal (general recommendation).
     */
    public static BigDecimal calculateFiberTarget(int totalCalories) {
        return round((totalCalories / 1000.0) * 14.0);
    }

    /**
     * Water: 35 ml per kg body weight (general guideline).
     */
    public static int calculateWaterTargetMl(double weightKg) {
        return (int) Math.round(weightKg * 35);
    }

    /**
     * Sleep: default recommendation of 8 hours.
     */
    public static BigDecimal defaultSleepTarget() {
        return BigDecimal.valueOf(8.0);
    }

    // ── Convenience: compute all targets and populate profile ─────────────

    public static void applyCalculatedTargets(UserProfile profile) {
        if (profile.getWeightKg() == null || profile.getHeightCm() == null
                || profile.getAge() == null || profile.getGender() == null
                || profile.getActivityLevel() == null || profile.getFitnessGoal() == null) {
            return; // Not enough data to calculate
        }

        double weight  = profile.getWeightKg().doubleValue();
        double height  = profile.getHeightCm().doubleValue();
        int    age     = profile.getAge();

        double bmr     = calculateBmr(weight, height, age, profile.getGender());
        double tdee    = calculateTdee(bmr, profile.getActivityLevel());
        int    calories = calculateDailyCalorieTarget(tdee, profile.getFitnessGoal());

        profile.setDailyCalorieTarget(calories);
        profile.setDailyProteinTarget(calculateProteinTarget(weight, profile.getFitnessGoal()));
        profile.setDailyCarbTarget(calculateCarbTarget(calories, profile.getFitnessGoal()));
        profile.setDailyFatTarget(calculateFatTarget(calories, profile.getFitnessGoal()));
        profile.setDailyFiberTarget(calculateFiberTarget(calories));
        profile.setDailyWaterTargetMl(calculateWaterTargetMl(weight));
        profile.setDailySleepTargetHours(defaultSleepTarget());
        profile.setTargetsManuallyOverridden(false);
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private static BigDecimal round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
