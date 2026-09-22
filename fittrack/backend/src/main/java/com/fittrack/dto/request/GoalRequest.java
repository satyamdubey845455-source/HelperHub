package com.fittrack.dto.request;

import com.fittrack.entity.FitnessGoal.GoalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {

    @NotNull(message = "Goal type is required")
    private GoalType goalType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private BigDecimal startingValue;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private String unit;
    private LocalDate startDate;
    private LocalDate targetDate;
}
