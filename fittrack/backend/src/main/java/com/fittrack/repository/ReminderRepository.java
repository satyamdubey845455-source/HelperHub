package com.fittrack.repository;

import com.fittrack.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByReminderTimeAsc(Long userId);
    List<Reminder> findByUserIdAndIsEnabledTrue(Long userId);
}
