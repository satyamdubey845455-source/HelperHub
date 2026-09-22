package com.fittrack.controller;

import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.NotificationResponse;
import com.fittrack.entity.User;
import com.fittrack.service.NotificationService;
import com.fittrack.utils.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", notificationService.getRecentNotifications(user)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Unread count", Map.of("unreadCount", notificationService.getUnreadCount(user))));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        notificationService.markAsRead(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = securityContextUtil.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
