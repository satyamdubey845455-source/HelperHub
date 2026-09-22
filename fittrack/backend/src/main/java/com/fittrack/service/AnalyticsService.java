package com.fittrack.service;

import com.fittrack.dto.response.AnalyticsResponse;
import com.fittrack.dto.response.AnalyticsResponse.DailyMetricPoint;
import com.fittrack.dto.response.CalendarDayResponse;
import com.fittrack.entity.*;
import com.fittrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MealRepository mealRepository;
    private final WaterLogRepository waterLogRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final SleepLogRepository sleepLogRepository;
    private final BodyMeasurementRepository bodyMeasurementRepository;
    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(User user, int days) {
        if (days <= 0 || days > 180) days = 30;

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        int calTarget = profile != null && profile.getDailyCalorieTarget() != null ? profile.getDailyCalorieTarget() : 2000;
        double protTarget = profile != null && profile.getDailyProteinTarget() != null ? profile.getDailyProteinTarget().doubleValue() : 120.0;
        int waterTarget = profile != null && profile.getDailyWaterTargetMl() != null ? profile.getDailyWaterTargetMl() : 2500;

        // Fetch datasets for range
        List<Meal> meals = mealRepository.findByUserIdAndLogDateBetween(user.getId(), startDate, endDate);
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndSessionDateBetween(user.getId(), startDate, endDate);
        List<SleepLog> sleeps = sleepLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), startDate, endDate);
        List<BodyMeasurement> measurements = bodyMeasurementRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), startDate, endDate);

        // Group meals by date
        Map<LocalDate, List<Meal>> mealsByDate = meals.stream().collect(Collectors.groupingBy(Meal::getLogDate));
        Map<LocalDate, List<WorkoutSession>> workoutsByDate = sessions.stream().collect(Collectors.groupingBy(WorkoutSession::getSessionDate));
        Map<LocalDate, SleepLog> sleepByDate = sleeps.stream().collect(Collectors.toMap(SleepLog::getLogDate, s -> s, (a, b) -> a));
        Map<LocalDate, BodyMeasurement> measurementsByDate = measurements.stream().collect(Collectors.toMap(BodyMeasurement::getLogDate, m -> m, (a, b) -> a));

        // Water daily totals
        List<Object[]> waterRows = waterLogRepository.dailyTotalsByDateRange(user.getId(), startDate, endDate);
        Map<LocalDate, Integer> waterByDate = new HashMap<>();
        for (Object[] r : waterRows) {
            waterByDate.put((LocalDate) r[0], ((Number) r[1]).intValue());
        }

        List<DailyMetricPoint> dailyPoints = new ArrayList<>();
        double totalCal = 0, totalProt = 0, totalWater = 0, totalSleep = 0, totalVolume = 0;
        int daysWithCalMet = 0, daysWithProtMet = 0, daysWithWaterMet = 0, workoutCount = 0;

        for (int i = 0; i < days; i++) {
            LocalDate d = startDate.plusDays(i);

            // Compute nutrition for date
            List<Meal> dayMeals = mealsByDate.getOrDefault(d, Collections.emptyList());
            BigDecimal dCal = BigDecimal.ZERO, dProt = BigDecimal.ZERO, dCarbs = BigDecimal.ZERO, dFat = BigDecimal.ZERO, dSugar = BigDecimal.ZERO;
            for (Meal m : dayMeals) {
                if (m.getItems() != null) {
                    for (MealItem item : m.getItems()) {
                        dCal   = dCal.add(orZero(item.getCaloriesConsumed()));
                        dProt  = dProt.add(orZero(item.getProteinConsumed()));
                        dCarbs = dCarbs.add(orZero(item.getCarbsConsumed()));
                        dFat   = dFat.add(orZero(item.getFatConsumed()));
                        dSugar = dSugar.add(orZero(item.getAddedSugarConsumed()));
                    }
                }
            }

            Integer dWater = waterByDate.getOrDefault(d, 0);
            SleepLog dSleep = sleepByDate.get(d);
            BigDecimal dSleepHours = dSleep != null ? dSleep.getDurationHours() : null;
            List<WorkoutSession> dWorkouts = workoutsByDate.getOrDefault(d, Collections.emptyList());
            boolean dWorkoutDone = !dWorkouts.isEmpty();
            BodyMeasurement dBm = measurementsByDate.get(d);
            BigDecimal dWeight = dBm != null ? dBm.getWeightKg() : null;

            dailyPoints.add(DailyMetricPoint.builder()
                    .date(d)
                    .calories(dCal)
                    .protein(dProt)
                    .carbs(dCarbs)
                    .fat(dFat)
                    .addedSugar(dSugar)
                    .waterMl(dWater)
                    .sleepHours(dSleepHours)
                    .workoutCompleted(dWorkoutDone)
                    .weightKg(dWeight)
                    .build());

            totalCal += dCal.doubleValue();
            totalProt += dProt.doubleValue();
            totalWater += dWater;
            if (dSleepHours != null) totalSleep += dSleepHours.doubleValue();
            if (dWorkoutDone) {
                workoutCount += dWorkouts.size();
                for (WorkoutSession ws : dWorkouts) {
                    if (ws.getSets() != null) {
                        for (WorkoutExerciseSet s : ws.getSets()) {
                            totalVolume += s.volume().doubleValue();
                        }
                    }
                }
            }

            if (dCal.doubleValue() >= calTarget * 0.9 && dCal.doubleValue() <= calTarget * 1.1) daysWithCalMet++;
            if (dProt.doubleValue() >= protTarget * 0.9) daysWithProtMet++;
            if (dWater >= waterTarget * 0.9) daysWithWaterMet++;
        }

        return AnalyticsResponse.builder()
                .period(days + "d")
                .startDate(startDate)
                .endDate(endDate)
                .avgDailyCalories(Math.round((totalCal / days) * 10.0) / 10.0)
                .avgDailyProteinG(Math.round((totalProt / days) * 10.0) / 10.0)
                .avgDailyWaterMl(Math.round((totalWater / days) * 10.0) / 10.0)
                .avgDailySleepHours(Math.round((totalSleep / days) * 10.0) / 10.0)
                .totalWorkoutsCompleted(workoutCount)
                .totalWorkoutVolumeKg(Math.round(totalVolume * 10.0) / 10.0)
                .calorieConsistencyPct(Math.round((daysWithCalMet / (double) days * 100.0) * 10.0) / 10.0)
                .proteinConsistencyPct(Math.round((daysWithProtMet / (double) days * 100.0) * 10.0) / 10.0)
                .waterConsistencyPct(Math.round((daysWithWaterMet / (double) days * 100.0) * 10.0) / 10.0)
                .workoutConsistencyPct(Math.round((workoutCount / (double) days * 100.0) * 10.0) / 10.0)
                .dailyTrends(dailyPoints)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CalendarDayResponse> getMonthlyCalendar(User user, YearMonth yearMonth) {
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Meal> meals = mealRepository.findByUserIdAndLogDateBetween(user.getId(), startDate, endDate);
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndSessionDateBetween(user.getId(), startDate, endDate);
        List<SleepLog> sleeps = sleepLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), startDate, endDate);
        List<BodyMeasurement> measurements = bodyMeasurementRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), startDate, endDate);

        Map<LocalDate, List<Meal>> mealsByDate = meals.stream().collect(Collectors.groupingBy(Meal::getLogDate));
        Map<LocalDate, List<WorkoutSession>> workoutsByDate = sessions.stream().collect(Collectors.groupingBy(WorkoutSession::getSessionDate));
        Map<LocalDate, SleepLog> sleepByDate = sleeps.stream().collect(Collectors.toMap(SleepLog::getLogDate, s -> s, (a, b) -> a));
        Map<LocalDate, BodyMeasurement> measurementsByDate = measurements.stream().collect(Collectors.toMap(BodyMeasurement::getLogDate, m -> m, (a, b) -> a));

        List<Object[]> waterRows = waterLogRepository.dailyTotalsByDateRange(user.getId(), startDate, endDate);
        Map<LocalDate, Integer> waterByDate = new HashMap<>();
        for (Object[] r : waterRows) {
            waterByDate.put((LocalDate) r[0], ((Number) r[1]).intValue());
        }

        List<CalendarDayResponse> calendarDays = new ArrayList<>();
        int daysInMonth = yearMonth.lengthOfMonth();

        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate d = yearMonth.atDay(day);
            List<Meal> dayMeals = mealsByDate.getOrDefault(d, Collections.emptyList());
            BigDecimal dCal = BigDecimal.ZERO, dProt = BigDecimal.ZERO;
            for (Meal m : dayMeals) {
                if (m.getItems() != null) {
                    for (MealItem item : m.getItems()) {
                        dCal  = dCal.add(orZero(item.getCaloriesConsumed()));
                        dProt = dProt.add(orZero(item.getProteinConsumed()));
                    }
                }
            }

            List<WorkoutSession> dWorkouts = workoutsByDate.getOrDefault(d, Collections.emptyList());
            boolean workoutDone = !dWorkouts.isEmpty();
            String workoutName = workoutDone ? dWorkouts.get(0).getName() : null;

            Integer dWater = waterByDate.getOrDefault(d, 0);
            SleepLog dSleep = sleepByDate.get(d);
            BigDecimal dSleepH = dSleep != null ? dSleep.getDurationHours() : null;
            BodyMeasurement dBm = measurementsByDate.get(d);
            BigDecimal dWeight = dBm != null ? dBm.getWeightKg() : null;

            calendarDays.add(CalendarDayResponse.builder()
                    .date(d)
                    .workoutCompleted(workoutDone)
                    .workoutName(workoutName)
                    .mealsLogged(dayMeals.size())
                    .totalCalories(dCal)
                    .totalProtein(dProt)
                    .waterMl(dWater)
                    .sleepHours(dSleepH)
                    .weightKg(dWeight)
                    .build());
        }

        return calendarDays;
    }

    private BigDecimal orZero(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}
