package com.fittrack.controller;

import com.fittrack.dto.response.AnalyticsResponse;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.CalendarDayResponse;
import com.fittrack.entity.User;
import com.fittrack.service.AnalyticsService;
import com.fittrack.utils.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Analytics data", analyticsService.getAnalytics(user, days)));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<CalendarDayResponse>>> getCalendar(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        User user = securityContextUtil.getCurrentUser();
        YearMonth targetMonth = month != null ? month : YearMonth.now();
        return ResponseEntity.ok(ApiResponse.ok("Calendar data", analyticsService.getMonthlyCalendar(user, targetMonth)));
    }
}
