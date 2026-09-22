package com.fittrack.repository;

import com.fittrack.entity.Meal;
import com.fittrack.entity.Meal.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByUserIdOrderByLogDateDesc(Long userId);

    List<Meal> findByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);

    List<Meal> findByUserIdAndLogDateOrderByMealTypeAsc(Long userId, LocalDate logDate);

    Optional<Meal> findByUserIdAndLogDateAndMealType(Long userId, LocalDate logDate, MealType mealType);

    @Query("SELECT m FROM Meal m LEFT JOIN FETCH m.items i LEFT JOIN FETCH i.food " +
           "WHERE m.user.id = :userId AND m.logDate = :date ORDER BY m.mealType")
    List<Meal> findByUserIdAndLogDateWithItems(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT m FROM Meal m WHERE m.user.id = :userId AND m.logDate BETWEEN :from AND :to ORDER BY m.logDate, m.mealType")
    List<Meal> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
