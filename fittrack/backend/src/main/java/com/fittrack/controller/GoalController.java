package com.fittrack.controller;

import com.fittrack.dto.request.GoalRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.GoalResponse;
import com.fittrack.entity.User;
import com.fittrack.service.GoalService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Goals retrieved", goalService.getGoals(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        User user = securityContextUtil.getCurrentUser();
        GoalResponse goal = goalService.createGoal(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Goal created", goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalRequest request) {
        User user = securityContextUtil.getCurrentUser();
        GoalResponse goal = goalService.updateGoal(user, id, request);
        String msg = Boolean.TRUE.equals(goal.getIsCompleted()) ? "🎉 Goal completed!" : "Goal updated";
        return ResponseEntity.ok(ApiResponse.ok(msg, goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        goalService.deleteGoal(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Goal deleted", null));
    }
}
