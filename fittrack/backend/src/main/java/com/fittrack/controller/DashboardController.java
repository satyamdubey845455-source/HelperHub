package com.fittrack.controller;

import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.DashboardResponse;
import com.fittrack.entity.User;
import com.fittrack.service.DashboardService;
import com.fittrack.utils.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityContextUtil securityContextUtil;

    /** GET /api/dashboard?date=2024-01-15  (defaults to today) */
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        User user = securityContextUtil.getCurrentUser();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        DashboardResponse data = dashboardService.buildDashboard(user, targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard loaded", data));
    }
}
