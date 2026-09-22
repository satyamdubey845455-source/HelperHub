package com.fittrack.dto.response;

import com.fittrack.entity.SleepLog.SleepQuality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SleepResponse {
    private Long id;
    private LocalDate logDate;
    private LocalDateTime sleepTime;
    private LocalDateTime wakeTime;
    private BigDecimal durationHours;
    private SleepQuality quality;
    private String notes;
}
