package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_logs",
       indexes = { @Index(name = "idx_water_user_date", columnList = "user_id, log_date") })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WaterLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    /** Amount in millilitres */
    @Column(name = "amount_ml", nullable = false)
    private Integer amountMl;

    @CreationTimestamp
    @Column(name = "logged_at", updatable = false)
    private LocalDateTime loggedAt;
}
