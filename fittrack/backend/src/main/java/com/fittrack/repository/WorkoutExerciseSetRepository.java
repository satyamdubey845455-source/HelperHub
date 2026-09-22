package com.fittrack.repository;

import com.fittrack.entity.WorkoutExerciseSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutExerciseSetRepository extends JpaRepository<WorkoutExerciseSet, Long> {

    /**
     * Find the best (heaviest) set for this user on a given exercise across all sessions.
     * Used for PR detection.
     */
    @Query("SELECT wes FROM WorkoutExerciseSet wes " +
           "WHERE wes.session.user.id = :userId AND wes.exercise.id = :exerciseId " +
           "AND wes.weightKg IS NOT NULL AND wes.reps IS NOT NULL " +
           "ORDER BY wes.weightKg DESC, wes.reps DESC")
    java.util.List<WorkoutExerciseSet> findBestSetsByUserAndExercise(
            @Param("userId") Long userId, @Param("exerciseId") Long exerciseId,
            org.springframework.data.domain.Pageable pageable);

    /** Find the PR set for an exercise (highest estimated 1RM using Epley formula) */
    @Query("SELECT wes FROM WorkoutExerciseSet wes " +
           "WHERE wes.session.user.id = :userId AND wes.exercise.id = :exerciseId " +
           "AND wes.session.id != :currentSessionId " +
           "AND wes.weightKg IS NOT NULL AND wes.reps IS NOT NULL " +
           "ORDER BY (wes.weightKg * (1 + wes.reps / 30.0)) DESC")
    List<WorkoutExerciseSet> findPreviousBestSet(
            @Param("userId") Long userId, @Param("exerciseId") Long exerciseId,
            @Param("currentSessionId") Long currentSessionId,
            org.springframework.data.domain.Pageable pageable);
}
