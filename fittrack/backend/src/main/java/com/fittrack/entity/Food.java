package com.fittrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "foods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "serving_size_g", precision = 8, scale = 2)
    private BigDecimal servingSizeG;

    @Column(name = "serving_size_unit", length = 20)
    private String servingSizeUnit;

    @Column(name = "calories_per_serving", precision = 8, scale = 2)
    private BigDecimal caloriesPerServing;

    @Column(name = "protein_g", precision = 6, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", precision = 6, scale = 2)
    private BigDecimal carbsG;

    @Column(name = "fat_g", precision = 6, scale = 2)
    private BigDecimal fatG;

    @Column(name = "fiber_g", precision = 6, scale = 2)
    private BigDecimal fiberG;

    @Column(name = "sugar_g", precision = 6, scale = 2)
    private BigDecimal sugarG;

    @Column(name = "sodium_mg", precision = 8, scale = 2)
    private BigDecimal sodiumMg;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "added_sugar_g", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal addedSugarG = BigDecimal.ZERO;

    @Column(name = "saturated_fat_g", precision = 6, scale = 2)
    private BigDecimal saturatedFatG;

    @Column(name = "cholesterol_mg", precision = 8, scale = 2)
    private BigDecimal cholesterolMg;

    @Column(name = "calcium_mg", precision = 8, scale = 2)
    private BigDecimal calciumMg;

    @Column(name = "iron_mg", precision = 8, scale = 2)
    private BigDecimal ironMg;

    @Column(name = "vitamin_d_microg", precision = 8, scale = 2)
    private BigDecimal vitaminDMicrog;

    @Column(name = "vitamin_b12_microg", precision = 8, scale = 2)
    private BigDecimal vitaminB12Microg;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = true;

    /** false = global food; true = user-created custom food */
    @Column(name = "is_custom")
    @Builder.Default
    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
