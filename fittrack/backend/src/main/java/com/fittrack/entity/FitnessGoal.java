package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fitness_goals",
       indexes = { @Index(name = "idx_goal_user", columnList = "user_id") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FitnessGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", length = 30)
    private GoalType goalType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "starting_value", precision = 10, scale = 2)
    private BigDecimal startingValue;

    @Column(name = "target_value", precision = 10, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "current_value", precision = 10, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Calculates true progress percentage (0–100) based on goal type.
     * For weight goals (loss or gain), progress is measured relative to starting point.
     */
    public Double progressPercent() {
        if (targetValue == null || currentValue == null) return null;

        if (goalType == GoalType.WEIGHT && startingValue != null) {
            double start = startingValue.doubleValue();
            double cur = currentValue.doubleValue();
            double tar = targetValue.doubleValue();

            if (tar == start) return 100.0;
            double progress = ((cur - start) / (tar - start)) * 100.0;
            return Math.min(100.0, Math.max(0.0, Math.round(progress * 10.0) / 10.0));
        }

        if (targetValue.doubleValue() == 0) return 0.0;
        double progress = (currentValue.doubleValue() / targetValue.doubleValue()) * 100.0;
        return Math.min(100.0, Math.max(0.0, Math.round(progress * 10.0) / 10.0));
    }

    public enum GoalType {
        WEIGHT, PROTEIN_CONSISTENCY, WATER_CONSISTENCY,
        WORKOUT_CONSISTENCY, STRENGTH, SLEEP, CALORIES, CUSTOM
    }
}
