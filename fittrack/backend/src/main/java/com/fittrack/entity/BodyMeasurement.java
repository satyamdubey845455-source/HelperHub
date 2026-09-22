package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "body_measurements",
       indexes = { @Index(name = "idx_bm_user_date", columnList = "user_id, log_date") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "waist_cm", precision = 5, scale = 2)
    private BigDecimal waistCm;

    @Column(name = "chest_cm", precision = 5, scale = 2)
    private BigDecimal chestCm;

    @Column(name = "arm_cm", precision = 5, scale = 2)
    private BigDecimal armCm;

    @Column(name = "thigh_cm", precision = 5, scale = 2)
    private BigDecimal thighCm;

    @Column(name = "body_fat_pct", precision = 5, scale = 2)
    private BigDecimal bodyFatPct;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
