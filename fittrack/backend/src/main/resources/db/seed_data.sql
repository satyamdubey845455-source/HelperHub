-- ============================================================
-- FitTrack — Seed Data
-- Run this AFTER the schema is created by Spring Boot (ddl-auto=update)
-- ============================================================

-- ----------------------------------------------------------------
-- FOODS (Global food database — 50+ common Indian foods)
-- serving_size_g is per standard serving; nutrition per that serving
-- ----------------------------------------------------------------

INSERT IGNORE INTO foods (name, serving_size_g, serving_size_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, is_custom) VALUES
-- Eggs & Dairy
('Egg (whole)', 50, 'g', 72, 6.3, 0.4, 4.8, 0.0, 0.4, 71, false),
('Egg White', 30, 'g', 16, 3.5, 0.2, 0.1, 0.0, 0.2, 54, false),
('Full Fat Milk', 240, 'ml', 149, 8.0, 11.7, 8.0, 0.0, 12.3, 107, false),
('Skimmed Milk', 240, 'ml', 83, 8.3, 12.2, 0.2, 0.0, 12.5, 103, false),
('Curd (Dahi)', 200, 'g', 122, 8.5, 9.0, 5.0, 0.0, 9.0, 80, false),
('Paneer (Cottage Cheese)', 100, 'g', 265, 18.3, 3.4, 20.8, 0.0, 3.4, 52, false),
('Whey Protein Powder', 30, 'g', 120, 24.0, 4.0, 2.0, 0.5, 2.0, 90, false),

-- Grains & Cereals
('White Rice (cooked)', 150, 'g', 194, 4.0, 43.0, 0.4, 0.4, 0.0, 1, false),
('Brown Rice (cooked)', 150, 'g', 163, 3.5, 34.0, 1.3, 1.6, 0.0, 5, false),
('Roti / Chapati (whole wheat)', 35, 'g', 101, 3.0, 18.0, 2.4, 2.5, 0.0, 122, false),
('Oats (uncooked)', 40, 'g', 148, 5.4, 26.3, 2.5, 3.9, 0.5, 2, false),
('Bread (whole wheat)', 28, 'g', 70, 3.6, 12.0, 1.1, 1.9, 1.5, 132, false),
('Bread (white)', 28, 'g', 79, 2.7, 15.1, 1.0, 0.6, 1.4, 142, false),
('Poha (flattened rice)', 30, 'g', 110, 2.0, 24.0, 0.3, 0.3, 0.2, 5, false),
('Idli', 50, 'g', 58, 2.0, 11.5, 0.4, 0.5, 0.2, 180, false),
('Dosa (plain)', 80, 'g', 112, 2.4, 19.3, 2.9, 0.4, 0.3, 125, false),

-- Pulses & Legumes
('Toor Dal (cooked)', 200, 'g', 198, 13.0, 34.0, 0.7, 9.0, 2.0, 10, false),
('Moong Dal (cooked)', 200, 'g', 212, 14.2, 37.0, 0.8, 7.6, 2.0, 12, false),
('Chana Dal (cooked)', 200, 'g', 242, 13.0, 42.0, 2.7, 8.5, 2.5, 14, false),
('Rajma (kidney beans, cooked)', 200, 'g', 254, 15.3, 45.0, 1.1, 13.0, 2.0, 6, false),
('Black Chana (cooked)', 200, 'g', 268, 15.6, 47.0, 2.5, 11.5, 2.0, 12, false),
('Moong Sprouts', 100, 'g', 30, 3.0, 5.9, 0.2, 1.8, 0.0, 6, false),
('Soya Chunks (dry)', 30, 'g', 117, 15.4, 9.3, 1.0, 3.0, 0.0, 5, false),

-- Meat & Fish
('Chicken Breast (cooked)', 100, 'g', 165, 31.0, 0.0, 3.6, 0.0, 0.0, 74, false),
('Chicken Leg (cooked)', 100, 'g', 191, 26.0, 0.0, 9.2, 0.0, 0.0, 82, false),
('Egg Omelette (2 eggs)', 100, 'g', 154, 11.0, 1.2, 11.5, 0.0, 1.0, 180, false),
('Tuna (canned in water)', 85, 'g', 100, 22.0, 0.0, 1.0, 0.0, 0.0, 320, false),
('Salmon (cooked)', 100, 'g', 208, 20.0, 0.0, 13.4, 0.0, 0.0, 59, false),
('Boiled Fish (rohu/catla)', 100, 'g', 140, 22.0, 0.0, 5.5, 0.0, 0.0, 60, false),

-- Fruits
('Banana', 120, 'g', 107, 1.3, 27.0, 0.4, 3.1, 14.4, 1, false),
('Apple', 182, 'g', 95, 0.5, 25.0, 0.3, 4.4, 19.0, 2, false),
('Orange', 131, 'g', 62, 1.2, 15.4, 0.2, 3.1, 12.2, 0, false),
('Mango', 165, 'g', 99, 1.4, 24.7, 0.6, 2.6, 22.5, 2, false),
('Papaya', 140, 'g', 55, 0.9, 14.0, 0.2, 2.5, 9.4, 8, false),
('Watermelon', 280, 'g', 85, 1.7, 21.5, 0.4, 1.1, 17.7, 3, false),
('Grapes', 92, 'g', 62, 0.6, 16.0, 0.3, 0.8, 15.0, 2, false),

-- Nuts & Seeds
('Almonds', 28, 'g', 164, 6.0, 6.1, 14.2, 3.5, 1.2, 0, false),
('Cashews', 28, 'g', 157, 5.2, 8.6, 12.4, 0.9, 1.7, 3, false),
('Peanuts (roasted)', 28, 'g', 166, 7.0, 6.1, 14.0, 2.4, 1.3, 115, false),
('Walnuts', 28, 'g', 185, 4.3, 3.9, 18.5, 1.9, 0.7, 1, false),
('Flaxseeds', 10, 'g', 55, 1.9, 3.0, 4.3, 2.8, 0.2, 3, false),
('Chia Seeds', 15, 'g', 73, 2.5, 6.3, 4.4, 4.8, 0.0, 6, false),

-- Vegetables
('Spinach (raw)', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, false),
('Broccoli (cooked)', 156, 'g', 55, 3.7, 11.2, 0.6, 5.1, 2.7, 64, false),
('Sweet Potato (boiled)', 150, 'g', 130, 2.1, 30.5, 0.1, 3.8, 9.4, 54, false),
('Potato (boiled)', 150, 'g', 116, 2.5, 26.7, 0.1, 3.0, 1.2, 7, false),
('Tomato', 123, 'g', 22, 1.1, 4.8, 0.2, 1.5, 3.2, 6, false),
('Cucumber', 119, 'g', 16, 0.7, 3.8, 0.1, 0.5, 1.8, 2, false),
('Carrot (raw)', 61, 'g', 25, 0.6, 5.8, 0.1, 1.7, 2.9, 42, false),

-- Oils & Fats
('Olive Oil', 14, 'ml', 119, 0.0, 0.0, 13.5, 0.0, 0.0, 0, false),
('Ghee', 14, 'g', 123, 0.0, 0.0, 14.0, 0.0, 0.0, 0, false),
('Peanut Butter (natural)', 32, 'g', 190, 8.0, 7.0, 16.0, 2.0, 3.0, 150, false);

-- ----------------------------------------------------------------
-- EXERCISES (Global exercise library)
-- ----------------------------------------------------------------

INSERT IGNORE INTO exercises (name, muscle_group, equipment, is_custom) VALUES
-- CHEST
('Bench Press (Barbell)', 'CHEST', 'Barbell, Bench', false),
('Incline Bench Press', 'CHEST', 'Barbell, Bench', false),
('Decline Bench Press', 'CHEST', 'Barbell, Bench', false),
('Dumbbell Fly', 'CHEST', 'Dumbbells, Bench', false),
('Incline Dumbbell Press', 'CHEST', 'Dumbbells, Bench', false),
('Cable Fly', 'CHEST', 'Cable Machine', false),
('Push-Up', 'CHEST', 'Bodyweight', false),
('Chest Dip', 'CHEST', 'Parallel Bars', false),
('Pec Deck Machine', 'CHEST', 'Machine', false),

-- BACK
('Lat Pulldown', 'BACK', 'Cable Machine', false),
('Barbell Row (Bent Over)', 'BACK', 'Barbell', false),
('Seated Cable Row', 'BACK', 'Cable Machine', false),
('Dumbbell Row (One-Arm)', 'BACK', 'Dumbbells, Bench', false),
('Pull-Up', 'BACK', 'Pull-Up Bar', false),
('Chin-Up', 'BACK', 'Pull-Up Bar', false),
('Deadlift', 'BACK', 'Barbell', false),
('Rack Pull', 'BACK', 'Barbell', false),
('T-Bar Row', 'BACK', 'T-Bar', false),
('Face Pull', 'BACK', 'Cable Machine', false),

-- SHOULDERS
('Overhead Press (Barbell)', 'SHOULDERS', 'Barbell', false),
('Dumbbell Shoulder Press', 'SHOULDERS', 'Dumbbells', false),
('Lateral Raise', 'SHOULDERS', 'Dumbbells', false),
('Front Raise', 'SHOULDERS', 'Dumbbells', false),
('Rear Delt Fly', 'SHOULDERS', 'Dumbbells', false),
('Arnold Press', 'SHOULDERS', 'Dumbbells', false),
('Upright Row', 'SHOULDERS', 'Barbell', false),
('Cable Lateral Raise', 'SHOULDERS', 'Cable Machine', false),

-- BICEPS
('Barbell Curl', 'BICEPS', 'Barbell', false),
('Dumbbell Curl', 'BICEPS', 'Dumbbells', false),
('Hammer Curl', 'BICEPS', 'Dumbbells', false),
('Concentration Curl', 'BICEPS', 'Dumbbells', false),
('Preacher Curl', 'BICEPS', 'EZ Bar, Preacher Bench', false),
('Cable Curl', 'BICEPS', 'Cable Machine', false),
('Incline Dumbbell Curl', 'BICEPS', 'Dumbbells, Bench', false),

-- TRICEPS
('Triceps Pushdown (Cable)', 'TRICEPS', 'Cable Machine', false),
('Skull Crusher', 'TRICEPS', 'EZ Bar, Bench', false),
('Overhead Triceps Extension', 'TRICEPS', 'Dumbbell', false),
('Close-Grip Bench Press', 'TRICEPS', 'Barbell, Bench', false),
('Triceps Dip', 'TRICEPS', 'Parallel Bars', false),
('Diamond Push-Up', 'TRICEPS', 'Bodyweight', false),

-- LEGS
('Barbell Squat', 'LEGS', 'Barbell, Squat Rack', false),
('Leg Press', 'LEGS', 'Leg Press Machine', false),
('Romanian Deadlift', 'LEGS', 'Barbell', false),
('Leg Curl (Lying)', 'LEGS', 'Machine', false),
('Leg Extension', 'LEGS', 'Machine', false),
('Lunges', 'LEGS', 'Dumbbells / Bodyweight', false),
('Bulgarian Split Squat', 'LEGS', 'Dumbbells, Bench', false),
('Calf Raise (Standing)', 'LEGS', 'Machine / Bodyweight', false),
('Seated Calf Raise', 'LEGS', 'Machine', false),
('Hack Squat', 'LEGS', 'Machine', false),

-- CORE
('Plank', 'CORE', 'Bodyweight', false),
('Crunch', 'CORE', 'Bodyweight', false),
('Bicycle Crunch', 'CORE', 'Bodyweight', false),
('Leg Raise (Hanging)', 'CORE', 'Pull-Up Bar', false),
('Ab Wheel Rollout', 'CORE', 'Ab Wheel', false),
('Russian Twist', 'CORE', 'Bodyweight / Weight Plate', false),
('Cable Crunch', 'CORE', 'Cable Machine', false),

-- FOREARMS
('Wrist Curl', 'FOREARMS', 'Barbell / Dumbbell', false),
('Reverse Wrist Curl', 'FOREARMS', 'Barbell / Dumbbell', false),
('Farmer Walk', 'FOREARMS', 'Dumbbells', false),

-- CARDIO
('Treadmill Run', 'CARDIO', 'Treadmill', false),
('Cycling (Stationary)', 'CARDIO', 'Stationary Bike', false),
('Jump Rope', 'CARDIO', 'Jump Rope', false),
('Rowing Machine', 'CARDIO', 'Rowing Machine', false),
('Elliptical', 'CARDIO', 'Elliptical Machine', false),
('Stair Climber', 'CARDIO', 'Stair Climber', false),
('HIIT (General)', 'CARDIO', 'Various', false);
