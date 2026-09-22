package com.fittrack.service;

import com.fittrack.dto.request.ReminderRequest;
import com.fittrack.dto.response.ReminderResponse;
import com.fittrack.entity.Reminder;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;

    @Transactional(readOnly = true)
    public List<ReminderResponse> getReminders(User user) {
        return reminderRepository.findByUserIdOrderByReminderTimeAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReminderResponse createReminder(User user, ReminderRequest req) {
        Reminder reminder = Reminder.builder()
                .user(user)
                .title(req.getTitle())
                .reminderType(req.getReminderType())
                .reminderTime(req.getReminderTime())
                .daysOfWeek(req.getDaysOfWeek() != null ? req.getDaysOfWeek() : "ALL")
                .isEnabled(req.getIsEnabled() != null ? req.getIsEnabled() : true)
                .notes(req.getNotes())
                .build();
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse updateReminder(User user, Long id, ReminderRequest req) {
        Reminder reminder = findAndVerify(user, id);
        reminder.setTitle(req.getTitle());
        reminder.setReminderType(req.getReminderType());
        reminder.setReminderTime(req.getReminderTime());
        if (req.getDaysOfWeek() != null) reminder.setDaysOfWeek(req.getDaysOfWeek());
        if (req.getIsEnabled() != null) reminder.setIsEnabled(req.getIsEnabled());
        reminder.setNotes(req.getNotes());
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse toggleReminder(User user, Long id) {
        Reminder reminder = findAndVerify(user, id);
        reminder.setIsEnabled(!reminder.getIsEnabled());
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public void deleteReminder(User user, Long id) {
        Reminder reminder = findAndVerify(user, id);
        reminderRepository.delete(reminder);
    }

    private Reminder findAndVerify(User user, Long id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> FitTrackException.notFound("Reminder"));
        if (!reminder.getUser().getId().equals(user.getId())) {
            throw FitTrackException.forbidden("Access denied to this reminder");
        }
        return reminder;
    }

    private ReminderResponse toResponse(Reminder r) {
        return ReminderResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .reminderType(r.getReminderType())
                .reminderTime(r.getReminderTime())
                .daysOfWeek(r.getDaysOfWeek())
                .isEnabled(r.getIsEnabled())
                .notes(r.getNotes())
                .build();
    }
}
