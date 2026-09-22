package com.fittrack.dto.response;

import com.fittrack.entity.Reminder.ReminderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    private Long id;
    private String title;
    private ReminderType reminderType;
    private LocalTime reminderTime;
    private String daysOfWeek;
    private Boolean isEnabled;
    private String notes;
}
