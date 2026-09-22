package com.fittrack.repository;

import com.fittrack.entity.Exercise;
import com.fittrack.entity.Exercise.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByMuscleGroupOrderByNameAsc(MuscleGroup muscleGroup);

    @Query("SELECT e FROM Exercise e WHERE " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
           "(e.isCustom = false OR e.createdBy.id = :userId) " +
           "ORDER BY e.muscleGroup ASC, e.name ASC")
    List<Exercise> searchExercises(@Param("query") String query, @Param("userId") Long userId);

    @Query("SELECT e FROM Exercise e WHERE e.isCustom = false ORDER BY e.muscleGroup ASC, e.name ASC")
    List<Exercise> findAllGlobalExercises();
}
