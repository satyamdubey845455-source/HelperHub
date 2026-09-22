package com.fittrack.dto.response;

import com.fittrack.entity.FitnessGoal.GoalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private GoalType goalType;
    private String title;
    private String description;
    private BigDecimal startingValue;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private String unit;
    private LocalDate startDate;
    private LocalDate targetDate;
    private Boolean isCompleted;
    private Double progressPercent;
}
