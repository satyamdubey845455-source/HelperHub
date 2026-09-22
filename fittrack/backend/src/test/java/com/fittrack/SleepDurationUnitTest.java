package com.fittrack;

import com.fittrack.entity.SleepLog;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class SleepDurationUnitTest {

    @Test
    void testOvernightSleepAcrossMidnight() {
        // Sleep at 11:00 PM, wake at 7:00 AM next day
        LocalDate date = LocalDate.of(2026, 9, 21);
        LocalDateTime sleep = LocalDateTime.of(2026, 9, 21, 23, 0);
        LocalDateTime wake = LocalDateTime.of(2026, 9, 22, 7, 0);

        SleepLog log = SleepLog.builder()
                .logDate(date)
                .sleepTime(sleep)
                .wakeTime(wake)
                .build();

        log.computeDuration();

        assertNotNull(log.getDurationHours());
        assertEquals(new BigDecimal("8.00"), log.getDurationHours());
    }

    @Test
    void testOvernightSleepWhenWakeTimeEnteredWithoutDateIncrement() {
        // User inputs 23:00 and 07:00 on the same date entry
        LocalDateTime sleep = LocalDateTime.of(2026, 9, 21, 23, 0);
        LocalDateTime wake = LocalDateTime.of(2026, 9, 21, 7, 0); // Before sleep on same day

        SleepLog log = SleepLog.builder()
                .sleepTime(sleep)
                .wakeTime(wake)
                .build();

        log.computeDuration();

        assertNotNull(log.getDurationHours());
        assertEquals(new BigDecimal("8.00"), log.getDurationHours());
    }
}
