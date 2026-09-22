package com.fittrack.dto.request;

import com.fittrack.entity.Reminder.ReminderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Reminder type is required")
    private ReminderType reminderType;

    @NotNull(message = "Reminder time is required")
    private LocalTime reminderTime;

    private String daysOfWeek;
    private Boolean isEnabled;
    private String notes;
}
