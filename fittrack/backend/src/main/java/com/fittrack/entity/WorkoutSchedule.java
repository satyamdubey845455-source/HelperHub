package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_schedules",
       uniqueConstraints = { @UniqueConstraint(name = "uk_user_day", columnNames = { "user_id", "day_of_week" }) },
       indexes = { @Index(name = "idx_sched_user", columnList = "user_id") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 15)
    private DayOfWeek dayOfWeek;

    @Column(name = "routine_name", length = 100)
    private String routineName;

    @Column(name = "target_muscle_groups", length = 150)
    private String targetMuscleGroups;

    @Column(name = "is_rest_day")
    @Builder.Default
    private Boolean isRestDay = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
