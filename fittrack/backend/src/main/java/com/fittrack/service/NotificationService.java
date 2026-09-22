package com.fittrack.service;

import com.fittrack.dto.response.NotificationResponse;
import com.fittrack.entity.Notification;
import com.fittrack.entity.Notification.NotificationCategory;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications(User user) {
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> FitTrackException.notFound("Notification"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw FitTrackException.forbidden("Access denied to this notification");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Transactional
    public Notification sendNotification(User user, String title, String message, NotificationCategory category) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .category(category)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
