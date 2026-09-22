package com.fittrack.service;

import com.fittrack.dto.request.WorkoutScheduleRequest;
import com.fittrack.dto.response.WorkoutScheduleResponse;
import com.fittrack.entity.User;
import com.fittrack.entity.WorkoutSchedule;
import com.fittrack.repository.WorkoutScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutScheduleService {

    private final WorkoutScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public List<WorkoutScheduleResponse> getWeeklySchedule(User user) {
        return scheduleRepository.findByUserIdOrderByDayOfWeekAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<WorkoutScheduleResponse> getTodaySchedule(User user, DayOfWeek dayOfWeek) {
        return scheduleRepository.findByUserIdAndDayOfWeek(user.getId(), dayOfWeek)
                .map(this::toResponse);
    }

    @Transactional
    public WorkoutScheduleResponse saveDaySchedule(User user, WorkoutScheduleRequest req) {
        WorkoutSchedule schedule = scheduleRepository.findByUserIdAndDayOfWeek(user.getId(), req.getDayOfWeek())
                .orElse(WorkoutSchedule.builder()
                        .user(user)
                        .dayOfWeek(req.getDayOfWeek())
                        .build());

        schedule.setRoutineName(req.getRoutineName());
        schedule.setTargetMuscleGroups(req.getTargetMuscleGroups());
        schedule.setIsRestDay(req.getIsRestDay() != null ? req.getIsRestDay() : false);
        schedule.setNotes(req.getNotes());

        return toResponse(scheduleRepository.save(schedule));
    }

    private WorkoutScheduleResponse toResponse(WorkoutSchedule s) {
        return WorkoutScheduleResponse.builder()
                .id(s.getId())
                .dayOfWeek(s.getDayOfWeek())
                .routineName(s.getRoutineName())
                .targetMuscleGroups(s.getTargetMuscleGroups())
                .isRestDay(s.getIsRestDay())
                .notes(s.getNotes())
                .build();
    }
}
