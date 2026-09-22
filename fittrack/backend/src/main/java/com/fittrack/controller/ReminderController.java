package com.fittrack.controller;

import com.fittrack.dto.request.ReminderRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.ReminderResponse;
import com.fittrack.entity.User;
import com.fittrack.service.ReminderService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReminderResponse>>> getReminders() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Reminders retrieved", reminderService.getReminders(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReminderResponse>> createReminder(@Valid @RequestBody ReminderRequest request) {
        User user = securityContextUtil.getCurrentUser();
        ReminderResponse response = reminderService.createReminder(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Reminder created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReminderResponse>> updateReminder(
            @PathVariable Long id, @Valid @RequestBody ReminderRequest request) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Reminder updated", reminderService.updateReminder(user, id, request)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<ReminderResponse>> toggleReminder(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Reminder toggled", reminderService.toggleReminder(user, id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReminder(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        reminderService.deleteReminder(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Reminder deleted", null));
    }
}
