package com.fittrack.controller;

import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.ExerciseResponse;
import com.fittrack.entity.Exercise;
import com.fittrack.entity.User;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.utils.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> searchExercises(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "muscleGroup", required = false) Exercise.MuscleGroup muscleGroup) {
        User user = securityContextUtil.getCurrentUser();
        Long userId = user != null ? user.getId() : -1L;

        List<Exercise> exercises;
        if (query != null && !query.trim().isEmpty()) {
            exercises = exerciseRepository.searchExercises(query.trim(), userId);
        } else if (muscleGroup != null) {
            exercises = exerciseRepository.findByMuscleGroupOrderByNameAsc(muscleGroup);
        } else {
            exercises = exerciseRepository.findAllGlobalExercises();
        }

        List<ExerciseResponse> responses = exercises.stream()
                .map(e -> ExerciseResponse.builder()
                        .id(e.getId())
                        .name(e.getName())
                        .muscleGroup(e.getMuscleGroup() != null ? e.getMuscleGroup().name() : null)
                        .equipment(e.getEquipment())
                        .description(e.getDescription())
                        .isCustom(e.getIsCustom())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Exercises retrieved", responses));
    }
}
