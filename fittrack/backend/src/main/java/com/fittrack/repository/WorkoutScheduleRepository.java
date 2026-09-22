package com.fittrack.repository;

import com.fittrack.entity.WorkoutSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutScheduleRepository extends JpaRepository<WorkoutSchedule, Long> {
    List<WorkoutSchedule> findByUserIdOrderByDayOfWeekAsc(Long userId);
    Optional<WorkoutSchedule> findByUserIdAndDayOfWeek(Long userId, DayOfWeek dayOfWeek);
}
