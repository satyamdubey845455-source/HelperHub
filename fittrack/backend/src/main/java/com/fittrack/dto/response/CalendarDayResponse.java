package com.fittrack.dto.response;

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
public class CalendarDayResponse {
    private LocalDate date;
    private Boolean workoutCompleted;
    private String workoutName;
    private Integer mealsLogged;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private Integer waterMl;
    private BigDecimal sleepHours;
    private BigDecimal weightKg;
}
