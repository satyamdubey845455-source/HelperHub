package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sleep_logs",
       indexes = { @Index(name = "idx_sl_user_date", columnList = "user_id, log_date") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "sleep_time")
    private LocalDateTime sleepTime;

    @Column(name = "wake_time")
    private LocalDateTime wakeTime;

    /** Duration in hours — computed from sleepTime and wakeTime */
    @Column(name = "duration_hours", precision = 4, scale = 2)
    private BigDecimal durationHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality", length = 15)
    private SleepQuality quality;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** Computes duration from sleepTime to wakeTime and sets durationHours, properly handling overnight sleep across midnight */
    public void computeDuration() {
        if (sleepTime != null && wakeTime != null) {
            LocalDateTime effectiveWake = wakeTime;
            if (effectiveWake.isBefore(sleepTime)) {
                effectiveWake = effectiveWake.plusDays(1);
            }
            long minutes = java.time.Duration.between(sleepTime, effectiveWake).toMinutes();
            if (minutes > 0) {
                durationHours = BigDecimal.valueOf(minutes / 60.0)
                        .setScale(2, java.math.RoundingMode.HALF_UP);
            }
        }
    }

    public enum SleepQuality { POOR, FAIR, GOOD, EXCELLENT, TERRIBLE }
}
