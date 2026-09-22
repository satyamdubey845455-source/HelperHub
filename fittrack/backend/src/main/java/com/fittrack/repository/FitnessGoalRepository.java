package com.fittrack.repository;

import com.fittrack.entity.FitnessGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FitnessGoalRepository extends JpaRepository<FitnessGoal, Long> {

    List<FitnessGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FitnessGoal> findByUserIdAndIsCompletedFalseOrderByTargetDateAsc(Long userId);
}
