package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workout_exercise_sets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutExerciseSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    /** Automatically set to true when this set beats the user's previous best */
    @Column(name = "is_pr")
    @Builder.Default
    private Boolean isPr = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Estimated 1-Rep Max using Epley formula: weight × (1 + reps/30)
     * Returns 0 if reps or weight is null.
     */
    public BigDecimal estimatedOneRepMax() {
        if (reps == null || weightKg == null || reps == 0) return BigDecimal.ZERO;
        double e1rm = weightKg.doubleValue() * (1 + reps / 30.0);
        return BigDecimal.valueOf(e1rm).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    /** Volume for this set = weight × reps */
    public BigDecimal volume() {
        if (reps == null || weightKg == null) return BigDecimal.ZERO;
        return weightKg.multiply(BigDecimal.valueOf(reps));
    }
}
