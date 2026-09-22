package com.fittrack.service;

import com.fittrack.dto.request.GoalRequest;
import com.fittrack.dto.response.GoalResponse;
import com.fittrack.entity.FitnessGoal;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.FitnessGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class GoalService {

    private final FitnessGoalRepository goalRepository;

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(User user) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse createGoal(User user, GoalRequest req) {
        FitnessGoal goal = FitnessGoal.builder()
                .user(user)
                .goalType(req.getGoalType())
                .title(req.getTitle())
                .description(req.getDescription())
                .startingValue(req.getStartingValue() != null ? req.getStartingValue() : req.getCurrentValue())
                .targetValue(req.getTargetValue())
                .currentValue(req.getCurrentValue())
                .unit(req.getUnit())
                .startDate(req.getStartDate())
                .targetDate(req.getTargetDate())
                .isCompleted(false)
                .build();
        Double progress = goal.progressPercent();
        if (progress != null && progress >= 100.0) {
            goal.setIsCompleted(true);
        }
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateGoal(User user, Long goalId, GoalRequest req) {
        FitnessGoal goal = getOwnedGoal(user, goalId);
        goal.setTitle(req.getTitle());
        goal.setDescription(req.getDescription());
        if (req.getStartingValue() != null) goal.setStartingValue(req.getStartingValue());
        goal.setTargetValue(req.getTargetValue());
        goal.setCurrentValue(req.getCurrentValue());
        goal.setUnit(req.getUnit());
        goal.setTargetDate(req.getTargetDate());
        Double progress = goal.progressPercent();
        if (progress != null && progress >= 100.0) {
            goal.setIsCompleted(true);
        }
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(User user, Long goalId) {
        FitnessGoal goal = getOwnedGoal(user, goalId);
        goalRepository.delete(goal);
    }

    private FitnessGoal getOwnedGoal(User user, Long goalId) {
        FitnessGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> FitTrackException.notFound("Goal"));
        if (!goal.getUser().getId().equals(user.getId()))
            throw FitTrackException.forbidden("You do not have access to this goal");
        return goal;
    }

    public GoalResponse toResponse(FitnessGoal g) {
        return GoalResponse.builder()
                .id(g.getId())
                .goalType(g.getGoalType())
                .title(g.getTitle())
                .description(g.getDescription())
                .startingValue(g.getStartingValue())
                .targetValue(g.getTargetValue())
                .currentValue(g.getCurrentValue())
                .unit(g.getUnit())
                .startDate(g.getStartDate())
                .targetDate(g.getTargetDate())
                .isCompleted(g.getIsCompleted())
                .progressPercent(g.progressPercent())
                .build();
    }
}
