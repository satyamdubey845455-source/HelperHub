package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reminders",
       indexes = { @Index(name = "idx_rem_user", columnList = "user_id, is_enabled") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false, length = 20)
    private ReminderType reminderType;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime;

    /** Comma-separated days e.g. "MON,TUE,WED,THU,FRI,SAT,SUN" */
    @Column(name = "days_of_week", length = 50)
    @Builder.Default
    private String daysOfWeek = "ALL";

    @Column(name = "is_enabled")
    @Builder.Default
    private Boolean isEnabled = true;

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ReminderType {
        WATER, WORKOUT, MEAL, SLEEP, GOAL, OTHER
    }
}
