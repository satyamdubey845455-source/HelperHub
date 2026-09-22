package com.fittrack.repository;

import com.fittrack.entity.MealTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealTemplateRepository extends JpaRepository<MealTemplate, Long> {
    
    @Query("SELECT DISTINCT t FROM MealTemplate t LEFT JOIN FETCH t.items i LEFT JOIN FETCH i.food WHERE t.user.id = :userId ORDER BY t.templateName ASC")
    List<MealTemplate> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("SELECT t FROM MealTemplate t LEFT JOIN FETCH t.items i LEFT JOIN FETCH i.food WHERE t.id = :id AND t.user.id = :userId")
    Optional<MealTemplate> findByIdAndUserIdWithItems(@Param("id") Long id, @Param("userId") Long userId);
}
