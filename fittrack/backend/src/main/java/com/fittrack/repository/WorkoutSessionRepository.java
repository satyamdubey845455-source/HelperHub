package com.fittrack.repository;

import com.fittrack.entity.WorkoutSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserIdOrderBySessionDateDesc(Long userId);

    List<WorkoutSession> findByUserIdAndSessionDateBetween(Long userId, LocalDate from, LocalDate to);

    List<WorkoutSession> findByUserIdAndSessionDateOrderByCreatedAtDesc(Long userId, LocalDate sessionDate);

    Page<WorkoutSession> findByUserIdOrderBySessionDateDesc(Long userId, Pageable pageable);

    @Query("SELECT ws FROM WorkoutSession ws LEFT JOIN FETCH ws.sets s LEFT JOIN FETCH s.exercise " +
           "WHERE ws.id = :id AND ws.user.id = :userId")
    Optional<WorkoutSession> findByIdAndUserIdWithSets(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT COUNT(ws) FROM WorkoutSession ws WHERE ws.user.id = :userId AND ws.sessionDate BETWEEN :from AND :to")
    Long countByUserIdAndDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
