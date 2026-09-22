package com.fittrack.controller;

import com.fittrack.dto.request.WorkoutScheduleRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.WorkoutScheduleResponse;
import com.fittrack.entity.User;
import com.fittrack.service.WorkoutScheduleService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts/schedule")
@RequiredArgsConstructor
public class WorkoutScheduleController {

    private final WorkoutScheduleService workoutScheduleService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkoutScheduleResponse>>> getSchedule() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Workout schedule retrieved", workoutScheduleService.getWeeklySchedule(user)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<WorkoutScheduleResponse>> saveDaySchedule(
            @Valid @RequestBody WorkoutScheduleRequest request) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Workout day schedule saved", workoutScheduleService.saveDaySchedule(user, request)));
    }
}
