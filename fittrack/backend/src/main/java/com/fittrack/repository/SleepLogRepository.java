package com.fittrack.repository;

import com.fittrack.entity.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {

    List<SleepLog> findByUserIdOrderByLogDateDesc(Long userId);

    Optional<SleepLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<SleepLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT AVG(s.durationHours) FROM SleepLog s WHERE s.user.id = :userId AND s.logDate BETWEEN :from AND :to")
    Double avgDurationByUserAndDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
