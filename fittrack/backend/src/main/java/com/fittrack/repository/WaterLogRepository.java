package com.fittrack.repository;

import com.fittrack.entity.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {

    List<WaterLog> findByUserIdOrderByLogDateDesc(Long userId);

    List<WaterLog> findByUserIdAndLogDateOrderByLoggedAtAsc(Long userId, LocalDate logDate);

    @Query("SELECT COALESCE(SUM(w.amountMl), 0) FROM WaterLog w WHERE w.user.id = :userId AND w.logDate = :date")
    Integer sumAmountByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT w.logDate, COALESCE(SUM(w.amountMl), 0) FROM WaterLog w " +
           "WHERE w.user.id = :userId AND w.logDate BETWEEN :from AND :to " +
           "GROUP BY w.logDate ORDER BY w.logDate")
    List<Object[]> dailyTotalsByDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
