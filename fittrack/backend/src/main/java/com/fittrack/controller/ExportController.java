package com.fittrack.controller;

import com.fittrack.dto.response.ApiResponse;
import com.fittrack.entity.*;
import com.fittrack.repository.*;
import com.fittrack.utils.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportController {

    private final SecurityContextUtil securityContextUtil;
    private final MealRepository mealRepository;
    private final WaterLogRepository waterLogRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final SleepLogRepository sleepLogRepository;
    private final BodyMeasurementRepository bodyMeasurementRepository;
    private final FitnessGoalRepository goalRepository;

    @GetMapping(value = "/json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportJson() {
        User user = securityContextUtil.getCurrentUser();
        Long uid = user.getId();

        Map<String, Object> export = new LinkedHashMap<>();
        export.put("exportDate", LocalDate.now().toString());

        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("email", user.getEmail());
        userInfo.put("fullName", user.getFullName());
        export.put("user", userInfo);

        // Meals mapped cleanly
        List<Map<String, Object>> mealList = new ArrayList<>();
        for (Meal m : mealRepository.findByUserIdOrderByLogDateDesc(uid)) {
            Map<String, Object> mm = new LinkedHashMap<>();
            mm.put("id", m.getId());
            mm.put("logDate", m.getLogDate().toString());
            mm.put("mealType", m.getMealType().name());
            mm.put("notes", m.getNotes());
            double cals = 0, pro = 0, carbs = 0, fat = 0;
            if (m.getItems() != null) {
                for (MealItem it : m.getItems()) {
                    if (it.getCaloriesConsumed() != null) cals += it.getCaloriesConsumed().doubleValue();
                    if (it.getProteinConsumed() != null) pro += it.getProteinConsumed().doubleValue();
                    if (it.getCarbsConsumed() != null) carbs += it.getCarbsConsumed().doubleValue();
                    if (it.getFatConsumed() != null) fat += it.getFatConsumed().doubleValue();
                }
            }
            mm.put("totalCalories", Math.round(cals));
            mm.put("totalProtein", Math.round(pro * 10.0) / 10.0);
            mm.put("totalCarbs", Math.round(carbs * 10.0) / 10.0);
            mm.put("totalFat", Math.round(fat * 10.0) / 10.0);
            mealList.add(mm);
        }
        export.put("meals", mealList);

        // Water
        List<Map<String, Object>> waterList = new ArrayList<>();
        for (WaterLog w : waterLogRepository.findByUserIdOrderByLogDateDesc(uid)) {
            Map<String, Object> wm = new LinkedHashMap<>();
            wm.put("id", w.getId());
            wm.put("logDate", w.getLogDate().toString());
            wm.put("amountMl", w.getAmountMl());
            waterList.add(wm);
        }
        export.put("waterLogs", waterList);

        // Workouts
        List<Map<String, Object>> workoutList = new ArrayList<>();
        for (WorkoutSession ws : workoutSessionRepository.findByUserIdOrderBySessionDateDesc(uid)) {
            Map<String, Object> wsm = new LinkedHashMap<>();
            wsm.put("id", ws.getId());
            wsm.put("name", ws.getName());
            wsm.put("sessionDate", ws.getSessionDate().toString());
            wsm.put("durationMinutes", ws.getDurationMinutes());
            wsm.put("notes", ws.getNotes());
            workoutList.add(wsm);
        }
        export.put("workoutSessions", workoutList);

        // Sleep
        List<Map<String, Object>> sleepList = new ArrayList<>();
        for (SleepLog sl : sleepLogRepository.findByUserIdOrderByLogDateDesc(uid)) {
            Map<String, Object> slm = new LinkedHashMap<>();
            slm.put("id", sl.getId());
            slm.put("logDate", sl.getLogDate().toString());
            slm.put("sleepTime", sl.getSleepTime() != null ? sl.getSleepTime().toString() : null);
            slm.put("wakeTime", sl.getWakeTime() != null ? sl.getWakeTime().toString() : null);
            slm.put("durationHours", sl.getDurationHours());
            slm.put("quality", sl.getQuality() != null ? sl.getQuality().name() : null);
            sleepList.add(slm);
        }
        export.put("sleepLogs", sleepList);

        // Measurements
        List<Map<String, Object>> measList = new ArrayList<>();
        for (BodyMeasurement bm : bodyMeasurementRepository.findByUserIdOrderByLogDateDesc(uid)) {
            Map<String, Object> bmm = new LinkedHashMap<>();
            bmm.put("id", bm.getId());
            bmm.put("logDate", bm.getLogDate().toString());
            bmm.put("weightKg", bm.getWeightKg());
            bmm.put("waistCm", bm.getWaistCm());
            bmm.put("chestCm", bm.getChestCm());
            bmm.put("armCm", bm.getArmCm());
            bmm.put("thighCm", bm.getThighCm());
            bmm.put("bodyFatPct", bm.getBodyFatPct());
            measList.add(bmm);
        }
        export.put("bodyMeasurements", measList);

        // Goals
        List<Map<String, Object>> goalList = new ArrayList<>();
        for (FitnessGoal g : goalRepository.findByUserIdOrderByCreatedAtDesc(uid)) {
            Map<String, Object> gm = new LinkedHashMap<>();
            gm.put("id", g.getId());
            gm.put("goalType", g.getGoalType().name());
            gm.put("targetValue", g.getTargetValue());
            gm.put("currentValue", g.getCurrentValue());
            gm.put("startingValue", g.getStartingValue());
            gm.put("isCompleted", g.getIsCompleted());
            goalList.add(gm);
        }
        export.put("goals", goalList);

        return ResponseEntity.ok(ApiResponse.ok("User data exported successfully", export));
    }

    @GetMapping(value = "/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestParam(defaultValue = "all") String type) {
        User user = securityContextUtil.getCurrentUser();
        Long uid = user.getId();

        StringBuilder csv = new StringBuilder();

        // Nutrition summary CSV
        csv.append("### NUTRITION LOGS ###\n");
        csv.append("Date,Meal Type,Calories,Protein(g),Carbs(g),Fat(g),Notes\n");
        for (Meal m : mealRepository.findByUserIdOrderByLogDateDesc(uid)) {
            double cals = 0, pro = 0, carbs = 0, fat = 0;
            if (m.getItems() != null) {
                for (MealItem it : m.getItems()) {
                    if (it.getCaloriesConsumed() != null) cals += it.getCaloriesConsumed().doubleValue();
                    if (it.getProteinConsumed() != null) pro += it.getProteinConsumed().doubleValue();
                    if (it.getCarbsConsumed() != null) carbs += it.getCarbsConsumed().doubleValue();
                    if (it.getFatConsumed() != null) fat += it.getFatConsumed().doubleValue();
                }
            }
            csv.append(m.getLogDate()).append(",")
               .append(m.getMealType()).append(",")
               .append(Math.round(cals)).append(",")
               .append(Math.round(pro * 10.0) / 10.0).append(",")
               .append(Math.round(carbs * 10.0) / 10.0).append(",")
               .append(Math.round(fat * 10.0) / 10.0).append(",")
               .append(m.getNotes() != null ? "\"" + m.getNotes().replace("\"", "\"\"") + "\"" : "")
               .append("\n");
        }

        // Water CSV
        csv.append("\n### WATER LOGS ###\n");
        csv.append("Date,Amount (ml)\n");
        for (WaterLog w : waterLogRepository.findByUserIdOrderByLogDateDesc(uid)) {
            csv.append(w.getLogDate()).append(",").append(w.getAmountMl()).append("\n");
        }

        // Workouts CSV
        csv.append("\n### WORKOUTS ###\n");
        csv.append("Date,Routine Name,Duration (min),Notes\n");
        for (WorkoutSession ws : workoutSessionRepository.findByUserIdOrderBySessionDateDesc(uid)) {
            csv.append(ws.getSessionDate()).append(",")
               .append(ws.getName() != null ? "\"" + ws.getName().replace("\"", "\"\"") + "\"" : "").append(",")
               .append(ws.getDurationMinutes() != null ? ws.getDurationMinutes() : "").append(",")
               .append(ws.getNotes() != null ? "\"" + ws.getNotes().replace("\"", "\"\"") + "\"" : "")
               .append("\n");
        }

        // Sleep CSV
        csv.append("\n### SLEEP ###\n");
        csv.append("Date,Duration (hours),Quality,Notes\n");
        for (SleepLog sl : sleepLogRepository.findByUserIdOrderByLogDateDesc(uid)) {
            csv.append(sl.getLogDate()).append(",")
               .append(sl.getDurationHours() != null ? sl.getDurationHours() : "").append(",")
               .append(sl.getQuality() != null ? sl.getQuality().name() : "").append(",")
               .append(sl.getNotes() != null ? "\"" + sl.getNotes().replace("\"", "\"\"") + "\"" : "")
               .append("\n");
        }

        // Measurements CSV
        csv.append("\n### BODY MEASUREMENTS ###\n");
        csv.append("Date,Weight (kg),Waist (cm),Chest (cm),Arms (cm),Thighs (cm),Body Fat (%)\n");
        for (BodyMeasurement bm : bodyMeasurementRepository.findByUserIdOrderByLogDateDesc(uid)) {
            csv.append(bm.getLogDate()).append(",")
               .append(bm.getWeightKg() != null ? bm.getWeightKg() : "").append(",")
               .append(bm.getWaistCm() != null ? bm.getWaistCm() : "").append(",")
               .append(bm.getChestCm() != null ? bm.getChestCm() : "").append(",")
               .append(bm.getArmCm() != null ? bm.getArmCm() : "").append(",")
               .append(bm.getThighCm() != null ? bm.getThighCm() : "").append(",")
               .append(bm.getBodyFatPct() != null ? bm.getBodyFatPct() : "")
               .append("\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fittrack_export_" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
