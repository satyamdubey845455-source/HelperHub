package com.fittrack.service;

import com.fittrack.dto.response.DashboardResponse;
import com.fittrack.dto.response.DashboardResponse.*;
import com.fittrack.entity.*;
import com.fittrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MealRepository mealRepository;
    private final WaterLogRepository waterLogRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutScheduleRepository workoutScheduleRepository;
    private final SleepLogRepository sleepLogRepository;
    private final BodyMeasurementRepository bodyMeasurementRepository;
    private final UserProfileRepository profileRepository;
    private final FitnessGoalRepository goalRepository;

    @Transactional(readOnly = true)
    public DashboardResponse buildDashboard(User user, LocalDate date) {
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        // ── Nutrition ──────────────────────────────────────────────────────
        List<Meal> meals = mealRepository.findByUserIdAndLogDateWithItems(user.getId(), date);
        BigDecimal cal = BigDecimal.ZERO, prot = BigDecimal.ZERO,
                   carbs = BigDecimal.ZERO, fat = BigDecimal.ZERO, fiber = BigDecimal.ZERO,
                   sugar = BigDecimal.ZERO, addedSugar = BigDecimal.ZERO, sodium = BigDecimal.ZERO;

        Map<String, BigDecimal> sugarByFood = new HashMap<>();

        for (Meal m : meals) {
            for (MealItem item : m.getItems()) {
                cal        = cal.add(orZero(item.getCaloriesConsumed()));
                prot       = prot.add(orZero(item.getProteinConsumed()));
                carbs      = carbs.add(orZero(item.getCarbsConsumed()));
                fat        = fat.add(orZero(item.getFatConsumed()));
                fiber      = fiber.add(orZero(item.getFiberConsumed()));
                sugar      = sugar.add(orZero(item.getSugarConsumed()));
                BigDecimal itemAddedSugar = orZero(item.getAddedSugarConsumed());
                addedSugar = addedSugar.add(itemAddedSugar);
                sodium     = sodium.add(orZero(item.getSodiumConsumed()));

                if (itemAddedSugar.compareTo(BigDecimal.ZERO) > 0 && item.getFood() != null) {
                    String fName = item.getFood().getName();
                    sugarByFood.put(fName, sugarByFood.getOrDefault(fName, BigDecimal.ZERO).add(itemAddedSugar));
                }
            }
        }

        List<SugarSourceItem> topAddedSugarSources = sugarByFood.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(e -> SugarSourceItem.builder().foodName(e.getKey()).grams(e.getValue().setScale(1, RoundingMode.HALF_UP)).build())
                .collect(Collectors.toList());

        // ── Water ──────────────────────────────────────────────────────────
        Integer totalWater = waterLogRepository.sumAmountByUserIdAndDate(user.getId(), date);

        // ── Workout ────────────────────────────────────────────────────────
        List<WorkoutSession> sessions = workoutSessionRepository
                .findByUserIdAndSessionDateOrderByCreatedAtDesc(user.getId(), date);
        boolean workoutDone = !sessions.isEmpty();
        String workoutName = workoutDone ? sessions.get(0).getName() : null;
        Integer workoutDuration = workoutDone ? sessions.get(0).getDurationMinutes() : null;

        // Today's scheduled workout
        DayOfWeek dow = date.getDayOfWeek();
        Optional<WorkoutSchedule> scheduled = workoutScheduleRepository.findByUserIdAndDayOfWeek(user.getId(), dow);
        String scheduledRoutine = scheduled.map(s -> {
            if (Boolean.TRUE.equals(s.getIsRestDay())) return "Rest & Recovery Day";
            return (s.getRoutineName() != null ? s.getRoutineName() : "") +
                   (s.getTargetMuscleGroups() != null ? " (" + s.getTargetMuscleGroups() + ")" : "");
        }).orElse("Custom Workout");

        // ── Sleep (previous night) ─────────────────────────────────────────
        Optional<SleepLog> sleep = sleepLogRepository.findByUserIdAndLogDate(user.getId(), date.minusDays(1));
        BigDecimal sleepHours = sleep.map(SleepLog::getDurationHours).orElse(null);
        String sleepQuality = sleep.map(s -> s.getQuality() != null ? s.getQuality().name() : null).orElse(null);

        // ── Body weight ────────────────────────────────────────────────────
        Optional<BodyMeasurement> latestMeasurement = bodyMeasurementRepository.findTopByUserIdOrderByLogDateDesc(user.getId());
        BigDecimal currentWeight = latestMeasurement.map(BodyMeasurement::getWeightKg).orElse(
                profile != null ? profile.getWeightKg() : null);

        // ── Targets ────────────────────────────────────────────────────────
        Integer calTarget = profile != null ? profile.getDailyCalorieTarget() : 2000;
        BigDecimal protTarget = profile != null ? profile.getDailyProteinTarget() : BigDecimal.valueOf(120);
        BigDecimal carbTarget = profile != null ? profile.getDailyCarbTarget() : BigDecimal.valueOf(250);
        BigDecimal fatTarget  = profile != null ? profile.getDailyFatTarget() : BigDecimal.valueOf(65);
        BigDecimal fiberTarget = profile != null ? profile.getDailyFiberTarget() : BigDecimal.valueOf(30);
        BigDecimal sugarTarget = BigDecimal.valueOf(25); // default recommended added sugar threshold: 25g
        Integer waterTarget = profile != null && profile.getDailyWaterTargetMl() != null ? profile.getDailyWaterTargetMl() : 2500;
        BigDecimal sleepTarget = profile != null && profile.getDailySleepTargetHours() != null ? profile.getDailySleepTargetHours() : BigDecimal.valueOf(8.0);

        // ── Progress % ─────────────────────────────────────────────────────
        Double calPct  = calcProgress(cal.doubleValue(), calTarget != null ? calTarget.doubleValue() : null);
        Double protPct = calcProgress(prot.doubleValue(), protTarget != null ? protTarget.doubleValue() : null);
        Double carbPct = calcProgress(carbs.doubleValue(), carbTarget != null ? carbTarget.doubleValue() : null);
        Double fatPct  = calcProgress(fat.doubleValue(), fatTarget != null ? fatTarget.doubleValue() : null);
        Double waterPct= calcProgress(totalWater != null ? totalWater.doubleValue() : 0.0, waterTarget != null ? waterTarget.doubleValue() : null);
        Double sleepPct= calcProgress(sleepHours != null ? sleepHours.doubleValue() : 0.0, sleepTarget != null ? sleepTarget.doubleValue() : null);
        Double sugarPct= calcProgress(addedSugar.doubleValue(), sugarTarget.doubleValue());

        // ── Sugar Warning Status ──────────────────────────────────────────
        String addedSugarStatus = "NORMAL";
        String addedSugarAlert = null;
        if (addedSugar.compareTo(sugarTarget) > 0) {
            addedSugarStatus = "EXCEEDED";
            addedSugarAlert = "Added sugar limit exceeded (" + addedSugar.setScale(1, RoundingMode.HALF_UP) + "g / " + sugarTarget + "g). Consider balancing with fiber & whole foods.";
        } else if (addedSugar.compareTo(sugarTarget.multiply(BigDecimal.valueOf(0.8))) >= 0) {
            addedSugarStatus = "APPROACHING_LIMIT";
            addedSugarAlert = "Added sugar getting close to daily threshold (" + addedSugar.setScale(1, RoundingMode.HALF_UP) + "g / " + sugarTarget + "g).";
        }

        // ── Smart Wellness & Nutrition Alerts (Section 20, 51) ─────────────
        List<SmartAlert> smartAlerts = new ArrayList<>();
        if (addedSugarAlert != null) {
            smartAlerts.add(SmartAlert.builder()
                    .category("NUTRITION")
                    .title("Added Sugar Alert")
                    .message(addedSugarAlert)
                    .level("EXCEEDED".equals(addedSugarStatus) ? "WARNING" : "INFO")
                    .build());
        }

        if (protTarget != null && prot.compareTo(protTarget) < 0) {
            BigDecimal remaining = protTarget.subtract(prot).setScale(1, RoundingMode.HALF_UP);
            smartAlerts.add(SmartAlert.builder()
                    .category("NUTRITION")
                    .title("Protein Target")
                    .message("Protein is below today's target. You have " + remaining + "g remaining.")
                    .level("INFO")
                    .build());
        }

        if (totalWater != null && waterTarget != null && totalWater < waterTarget) {
            int remMl = waterTarget - totalWater;
            smartAlerts.add(SmartAlert.builder()
                    .category("HYDRATION")
                    .title("Hydration Update")
                    .message("Consumed " + String.format(Locale.US, "%.1f", totalWater / 1000.0) + "L today. About " + remMl + "ml remains to reach your target.")
                    .level("INFO")
                    .build());
        }

        // ── "What should I do today?" Dynamic Assistant (Section 21) ───────
        List<FitnessGoal> goals = goalRepository.findByUserIdAndIsCompletedFalseOrderByTargetDateAsc(user.getId());
        String currentGoalTitle = !goals.isEmpty() ? goals.get(0).getTitle() :
                (profile != null && profile.getFitnessGoal() != null ? profile.getFitnessGoal().name().replace('_', ' ') : "Fitness & Health");

        TodayFocus todayFocus = TodayFocus.builder()
                .greeting("Welcome back, " + (user.getFullName() != null ? user.getFullName() : "Athlete") + " 👋")
                .scheduledWorkout(workoutDone ? "Completed: " + workoutName : "Scheduled: " + scheduledRoutine)
                .hydrationStatus(String.format(Locale.US, "%.1fL / %.1fL", (totalWater != null ? totalWater : 0) / 1000.0, waterTarget / 1000.0))
                .proteinStatus(prot.setScale(0, RoundingMode.HALF_UP) + "g / " + protTarget.setScale(0, RoundingMode.HALF_UP) + "g")
                .calorieStatus(cal.setScale(0, RoundingMode.HALF_UP) + " / " + calTarget + " kcal")
                .sleepStatus(sleepHours != null ? sleepHours.setScale(1, RoundingMode.HALF_UP) + " hrs" : "Not logged yet")
                .currentGoal(currentGoalTitle)
                .build();

        List<String> nextActions = new ArrayList<>();
        if (!workoutDone) {
            nextActions.add("Start today's workout: " + scheduledRoutine);
        }
        if (totalWater != null && waterTarget != null && totalWater < waterTarget) {
            nextActions.add("Drink 500ml water to maintain hydration");
        }
        if (protTarget != null && prot.compareTo(protTarget) < 0) {
            BigDecimal rem = protTarget.subtract(prot).setScale(0, RoundingMode.HALF_UP);
            nextActions.add("Add a protein-rich meal or snack (" + rem + "g remaining)");
        }
        if (meals.size() < 3) {
            nextActions.add("Log your next meal to stay on track");
        }
        if (sleepHours == null) {
            nextActions.add("Log your last night's sleep to calculate recovery");
        }
        if (nextActions.isEmpty()) {
            nextActions.add("All daily fitness targets reached! Great work today.");
        }

        // ── Weekly chart data (last 7 days) ────────────────────────────────
        List<DayNutritionSummary> weeklyNutrition = buildWeeklyNutrition(user.getId(), date);
        List<DayWaterSummary> weeklyWater = buildWeeklyWater(user.getId(), date);

        return DashboardResponse.builder()
                .date(date)
                .totalCalories(cal).totalProtein(prot).totalCarbs(carbs).totalFat(fat).totalFiber(fiber)
                .totalSugar(sugar).totalAddedSugar(addedSugar).totalSodium(sodium)
                .calorieTarget(calTarget).proteinTarget(protTarget).carbTarget(carbTarget)
                .fatTarget(fatTarget).fiberTarget(fiberTarget).addedSugarTarget(sugarTarget)
                .addedSugarStatus(addedSugarStatus).addedSugarAlert(addedSugarAlert)
                .topAddedSugarSources(topAddedSugarSources)
                .totalWaterMl(totalWater).waterTargetMl(waterTarget)
                .workoutCompleted(workoutDone).workoutName(workoutName).workoutDurationMinutes(workoutDuration)
                .sleepHours(sleepHours).sleepTarget(sleepTarget).sleepQuality(sleepQuality)
                .currentWeightKg(currentWeight)
                .calorieProgress(calPct).proteinProgress(protPct).carbProgress(carbPct).fatProgress(fatPct)
                .waterProgress(waterPct).sleepProgress(sleepPct).addedSugarProgress(sugarPct)
                .todayFocus(todayFocus)
                .nextActions(nextActions)
                .smartAlerts(smartAlerts)
                .weeklyNutrition(weeklyNutrition).weeklyWater(weeklyWater)
                .build();
    }

    // ── Private Helpers ────────────────────────────────────────────────────

    private List<DayNutritionSummary> buildWeeklyNutrition(Long userId, LocalDate today) {
        List<DayNutritionSummary> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<Meal> meals = mealRepository.findByUserIdAndLogDateWithItems(userId, d);
            BigDecimal cal = BigDecimal.ZERO, prot = BigDecimal.ZERO,
                       carbs = BigDecimal.ZERO, fat = BigDecimal.ZERO, sugar = BigDecimal.ZERO;
            for (Meal m : meals) {
                for (MealItem item : m.getItems()) {
                    cal   = cal.add(orZero(item.getCaloriesConsumed()));
                    prot  = prot.add(orZero(item.getProteinConsumed()));
                    carbs = carbs.add(orZero(item.getCarbsConsumed()));
                    fat   = fat.add(orZero(item.getFatConsumed()));
                    sugar = sugar.add(orZero(item.getAddedSugarConsumed()));
                }
            }
            result.add(DayNutritionSummary.builder()
                    .date(d)
                    .calories(cal)
                    .protein(prot)
                    .carbs(carbs)
                    .fat(fat)
                    .addedSugar(sugar)
                    .build());
        }
        return result;
    }

    private List<DayWaterSummary> buildWeeklyWater(Long userId, LocalDate today) {
        List<DayWaterSummary> result = new ArrayList<>();
        LocalDate from = today.minusDays(6);
        List<Object[]> rows = waterLogRepository.dailyTotalsByDateRange(userId, from, today);
        for (Object[] row : rows) {
            result.add(DayWaterSummary.builder()
                    .date((LocalDate) row[0])
                    .totalMl(((Number) row[1]).intValue())
                    .build());
        }
        return result;
    }

    private Double calcProgress(double current, Double target) {
        if (target == null || target == 0) return null;
        return Math.min(100.0, (current / target) * 100.0);
    }

    private BigDecimal orZero(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}
