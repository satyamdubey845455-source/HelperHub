package com.fittrack.config;

import com.fittrack.entity.Exercise;
import com.fittrack.entity.Food;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final ExerciseRepository exerciseRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedIndianFoods();
        seedGlobalExercises();
    }

    private void seedIndianFoods() {
        // Required 13 Indian Foods from Master Instruction Section 10
        List<FoodSeed> requiredIndianFoods = Arrays.asList(
                new FoodSeed("Utpam / Chawal ki Roti", "Indian Food", 100, "g", 160, 3.5, 32.0, 2.0, 1.5, 0.5, 0.0, 150),
                new FoodSeed("Chhole Bhature", "Indian Food", 250, "g", 520, 14.0, 68.0, 22.0, 7.0, 4.0, 1.5, 680),
                new FoodSeed("Paneer", "Dairy", 100, "g", 265, 18.3, 3.4, 20.8, 0.0, 3.4, 0.0, 52),
                new FoodSeed("Chana ki Sabji", "Dal / Pulses", 150, "g", 195, 8.5, 26.0, 6.5, 6.0, 2.5, 0.0, 380),
                new FoodSeed("Paratha", "Roti / Bread", 80, "piece", 240, 4.5, 34.0, 9.5, 2.5, 1.0, 0.0, 210),
                new FoodSeed("Aloo ki Sabji", "Vegetables", 150, "g", 175, 3.2, 28.0, 6.0, 3.5, 2.0, 0.0, 340),
                new FoodSeed("Besan ka Kofta", "Indian Food", 150, "g", 280, 7.5, 22.0, 18.0, 4.0, 3.0, 0.5, 420),
                new FoodSeed("Dal Makhni", "Dal / Pulses", 150, "g", 230, 9.0, 24.0, 11.0, 5.0, 2.0, 0.0, 390),
                new FoodSeed("Chane ki Dal", "Dal / Pulses", 150, "g", 185, 10.5, 27.0, 4.0, 6.5, 1.5, 0.0, 320),
                new FoodSeed("Kheer-Puri", "Desserts", 200, "g", 480, 9.0, 65.0, 20.0, 2.0, 28.0, 22.0, 180),
                new FoodSeed("Rajma ki Sabji", "Dal / Pulses", 150, "g", 190, 11.0, 29.0, 4.5, 8.0, 2.0, 0.0, 360),
                new FoodSeed("Mix-Veg Sabji", "Vegetables", 150, "g", 130, 3.8, 16.0, 6.0, 4.5, 3.5, 0.0, 290),
                new FoodSeed("Rayta", "Dairy", 100, "g", 75, 3.8, 6.0, 3.5, 0.5, 4.0, 0.0, 120)
        );

        for (FoodSeed s : requiredIndianFoods) {
            List<Food> existing = foodRepository.searchFoodsWithFilter(s.name, null, -1L);
            boolean match = existing.stream().anyMatch(f -> f.getName().equalsIgnoreCase(s.name));
            if (!match) {
                Food f = Food.builder()
                        .name(s.name)
                        .category(s.category)
                        .servingSizeG(BigDecimal.valueOf(s.servingSizeG))
                        .servingSizeUnit(s.servingUnit)
                        .caloriesPerServing(BigDecimal.valueOf(s.calories))
                        .proteinG(BigDecimal.valueOf(s.protein))
                        .carbsG(BigDecimal.valueOf(s.carbs))
                        .fatG(BigDecimal.valueOf(s.fat))
                        .fiberG(BigDecimal.valueOf(s.fiber))
                        .sugarG(BigDecimal.valueOf(s.sugar))
                        .addedSugarG(BigDecimal.valueOf(s.addedSugar))
                        .sodiumMg(BigDecimal.valueOf(s.sodium))
                        .isCustom(false)
                        .verified(true)
                        .source("National Indian Food Standard")
                        .build();
                foodRepository.save(f);
                log.info("Seeded Indian food: {}", s.name);
            }
        }
    }

    private void seedGlobalExercises() {
        if (exerciseRepository.count() > 0) return;

        List<ExerciseSeed> exercises = Arrays.asList(
                new ExerciseSeed("Bench Press (Barbell)", Exercise.MuscleGroup.CHEST, "Barbell, Bench"),
                new ExerciseSeed("Incline Dumbbell Press", Exercise.MuscleGroup.CHEST, "Dumbbells, Bench"),
                new ExerciseSeed("Push-Up", Exercise.MuscleGroup.CHEST, "Bodyweight"),
                new ExerciseSeed("Lat Pulldown", Exercise.MuscleGroup.BACK, "Cable Machine"),
                new ExerciseSeed("Barbell Row", Exercise.MuscleGroup.BACK, "Barbell"),
                new ExerciseSeed("Deadlift", Exercise.MuscleGroup.BACK, "Barbell"),
                new ExerciseSeed("Overhead Press", Exercise.MuscleGroup.SHOULDERS, "Barbell"),
                new ExerciseSeed("Lateral Raise", Exercise.MuscleGroup.SHOULDERS, "Dumbbells"),
                new ExerciseSeed("Barbell Curl", Exercise.MuscleGroup.BICEPS, "Barbell"),
                new ExerciseSeed("Hammer Curl", Exercise.MuscleGroup.BICEPS, "Dumbbells"),
                new ExerciseSeed("Triceps Pushdown", Exercise.MuscleGroup.TRICEPS, "Cable Machine"),
                new ExerciseSeed("Skull Crusher", Exercise.MuscleGroup.TRICEPS, "EZ Bar, Bench"),
                new ExerciseSeed("Barbell Squat", Exercise.MuscleGroup.LEGS, "Barbell, Squat Rack"),
                new ExerciseSeed("Leg Press", Exercise.MuscleGroup.LEGS, "Machine"),
                new ExerciseSeed("Romanian Deadlift", Exercise.MuscleGroup.LEGS, "Barbell"),
                new ExerciseSeed("Plank", Exercise.MuscleGroup.CORE, "Bodyweight"),
                new ExerciseSeed("Treadmill Run", Exercise.MuscleGroup.CARDIO, "Treadmill")
        );

        for (ExerciseSeed es : exercises) {
            exerciseRepository.save(Exercise.builder()
                    .name(es.name)
                    .muscleGroup(es.muscleGroup)
                    .equipment(es.equipment)
                    .isCustom(false)
                    .build());
        }
        log.info("Seeded global exercises library.");
    }

    private record FoodSeed(String name, String category, double servingSizeG, String servingUnit,
                            double calories, double protein, double carbs, double fat, double fiber,
                            double sugar, double addedSugar, double sodium) {}

    private record ExerciseSeed(String name, Exercise.MuscleGroup muscleGroup, String equipment) {}
}
