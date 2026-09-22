package com.fittrack.dto.request;

import com.fittrack.entity.SleepLog.SleepQuality;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SleepLogRequest {

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private LocalDateTime sleepTime;
    private LocalDateTime wakeTime;
    private SleepQuality quality;
    private String notes;
}
