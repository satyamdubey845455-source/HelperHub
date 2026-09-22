package com.fittrack;

import com.fittrack.entity.FitnessGoal;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GoalProgressUnitTest {

    @Test
    void testWeightLossRelativeProgress() {
        // Start 90kg, target 80kg, currently 85kg -> should be exactly 50%
        FitnessGoal goal = FitnessGoal.builder()
                .goalType(FitnessGoal.GoalType.WEIGHT)
                .startingValue(BigDecimal.valueOf(90))
                .targetValue(BigDecimal.valueOf(80))
                .currentValue(BigDecimal.valueOf(85))
                .build();

        Double progress = goal.progressPercent();
        assertEquals(50.0, progress);
    }

    @Test
    void testWeightGainRelativeProgress() {
        // Start 60kg, target 70kg, currently 65kg -> should be exactly 50%
        FitnessGoal goal = FitnessGoal.builder()
                .goalType(FitnessGoal.GoalType.WEIGHT)
                .startingValue(BigDecimal.valueOf(60))
                .targetValue(BigDecimal.valueOf(70))
                .currentValue(BigDecimal.valueOf(65))
                .build();

        Double progress = goal.progressPercent();
        assertEquals(50.0, progress);
    }

    @Test
    void testStandardGoalProgress() {
        // Workout frequency goal: target 20, current 15 -> 75%
        FitnessGoal goal = FitnessGoal.builder()
                .goalType(FitnessGoal.GoalType.WORKOUT_CONSISTENCY)
                .targetValue(BigDecimal.valueOf(20))
                .currentValue(BigDecimal.valueOf(15))
                .build();

        Double progress = goal.progressPercent();
        assertEquals(75.0, progress);
    }
}
