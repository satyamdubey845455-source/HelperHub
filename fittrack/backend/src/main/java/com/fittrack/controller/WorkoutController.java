package com.fittrack.controller;

import com.fittrack.dto.request.ExerciseSetRequest;
import com.fittrack.dto.request.WorkoutSessionRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.WorkoutSessionResponse;
import com.fittrack.dto.response.WorkoutSetResponse;
import com.fittrack.entity.User;
import com.fittrack.service.WorkoutService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WorkoutSessionResponse>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Workout history", workoutService.getHistory(user, page, size)));
    }

    @GetMapping("/date")
    public ResponseEntity<ApiResponse<List<WorkoutSessionResponse>>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Sessions for date", workoutService.getSessionsByDate(user, date)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutSessionResponse>> getSession(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Session detail", workoutService.getSession(user, id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkoutSessionResponse>> createSession(@Valid @RequestBody WorkoutSessionRequest req) {
        User user = securityContextUtil.getCurrentUser();
        WorkoutSessionResponse session = workoutService.createSession(user, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Workout session started", session));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutSessionResponse>> updateSession(@PathVariable Long id, @Valid @RequestBody WorkoutSessionRequest req) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Session updated", workoutService.updateSession(user, id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        workoutService.deleteSession(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Session deleted", null));
    }

    @PostMapping("/{id}/sets")
    public ResponseEntity<ApiResponse<WorkoutSetResponse>> addSet(@PathVariable Long id, @Valid @RequestBody ExerciseSetRequest req) {
        User user = securityContextUtil.getCurrentUser();
        WorkoutSetResponse set = workoutService.addSet(user, id, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(
                Boolean.TRUE.equals(set.getIsPr()) ? "🎉 New Personal Record!" : "Set logged", set));
    }

    @PutMapping("/{id}/sets/{setId}")
    public ResponseEntity<ApiResponse<WorkoutSetResponse>> updateSet(@PathVariable Long id, @PathVariable Long setId, @Valid @RequestBody ExerciseSetRequest req) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Set updated", workoutService.updateSet(user, id, setId, req)));
    }

    @DeleteMapping("/{id}/sets/{setId}")
    public ResponseEntity<ApiResponse<Void>> deleteSet(@PathVariable Long id, @PathVariable Long setId) {
        User user = securityContextUtil.getCurrentUser();
        workoutService.deleteSet(user, id, setId);
        return ResponseEntity.ok(ApiResponse.ok("Set deleted", null));
    }
}
