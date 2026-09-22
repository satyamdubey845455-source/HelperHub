package com.fittrack.controller;

import com.fittrack.dto.request.WaterLogRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.WaterLogResponse;
import com.fittrack.dto.response.WaterSummaryResponse;
import com.fittrack.entity.User;
import com.fittrack.service.WaterService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/water")
@RequiredArgsConstructor
public class WaterController {

    private final WaterService waterService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<WaterSummaryResponse>> getWaterForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Water logs retrieved", waterService.getWaterSummary(user, date)));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<List<Object[]>>> getWeeklyWater() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Weekly water data", waterService.getWeeklyTotals(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WaterLogResponse>> logWater(@Valid @RequestBody WaterLogRequest request) {
        User user = securityContextUtil.getCurrentUser();
        WaterLogResponse log = waterService.logWater(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Water logged", log));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        waterService.deleteLog(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Water log deleted", null));
    }
}
