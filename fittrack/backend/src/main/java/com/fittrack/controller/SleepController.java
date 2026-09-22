package com.fittrack.controller;

import com.fittrack.dto.request.SleepLogRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.SleepResponse;
import com.fittrack.entity.User;
import com.fittrack.service.SleepService;
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
@RequestMapping("/api/sleep")
@RequiredArgsConstructor
public class SleepController {

    private final SleepService sleepService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SleepResponse>>> getLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Sleep logs", sleepService.getLogsForRange(user, from, to)));
    }

    @GetMapping("/date")
    public ResponseEntity<ApiResponse<SleepResponse>> getForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        SleepResponse log = sleepService.getLogForDate(user, date).orElse(null);
        return ResponseEntity.ok(ApiResponse.ok("Sleep log for date", log));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SleepResponse>> logSleep(@Valid @RequestBody SleepLogRequest request) {
        User user = securityContextUtil.getCurrentUser();
        SleepResponse log = sleepService.logSleep(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Sleep logged", log));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SleepResponse>> updateLog(@PathVariable Long id, @Valid @RequestBody SleepLogRequest request) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Sleep log updated", sleepService.updateLog(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        sleepService.deleteLog(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Sleep log deleted", null));
    }
}
