package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercises")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", length = 20)
    private MuscleGroup muscleGroup;

    @Column(name = "equipment", length = 100)
    private String equipment;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_custom")
    @Builder.Default
    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    public enum MuscleGroup {
        CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, LEGS,
        CORE, CARDIO, FOREARMS, FULL_BODY
    }
}
