package com.fittrack.service;

import com.fittrack.dto.request.ExerciseSetRequest;
import com.fittrack.dto.request.WorkoutSessionRequest;
import com.fittrack.dto.response.WorkoutSessionResponse;
import com.fittrack.dto.response.WorkoutSetResponse;
import com.fittrack.entity.*;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class WorkoutService {

    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutExerciseSetRepository setRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional
    public WorkoutSessionResponse createSession(User user, WorkoutSessionRequest req) {
        WorkoutSession session = WorkoutSession.builder()
                .user(user)
                .sessionDate(req.getSessionDate())
                .name(req.getName())
                .notes(req.getNotes())
                .durationMinutes(req.getDurationMinutes())
                .startedAt(req.getStartedAt())
                .endedAt(req.getEndedAt())
                .build();
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public WorkoutSessionResponse getSession(User user, Long sessionId) {
        WorkoutSession session = sessionRepository.findByIdAndUserIdWithSets(sessionId, user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Workout session"));
        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSessionResponse> getSessionsByDate(User user, LocalDate date) {
        return sessionRepository.findByUserIdAndSessionDateOrderByCreatedAtDesc(user.getId(), date)
                .stream().map(this::toSessionResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WorkoutSessionResponse> getHistory(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return sessionRepository.findByUserIdOrderBySessionDateDesc(user.getId(), pageable)
                .map(this::toSessionResponse);
    }

    @Transactional
    public WorkoutSessionResponse updateSession(User user, Long sessionId, WorkoutSessionRequest req) {
        WorkoutSession session = getOwnedSession(user, sessionId);
        session.setName(req.getName());
        session.setNotes(req.getNotes());
        session.setDurationMinutes(req.getDurationMinutes());
        session.setStartedAt(req.getStartedAt());
        session.setEndedAt(req.getEndedAt());
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(User user, Long sessionId) {
        WorkoutSession session = getOwnedSession(user, sessionId);
        sessionRepository.delete(session);
    }

    @Transactional
    public WorkoutSetResponse addSet(User user, Long sessionId, ExerciseSetRequest req) {
        WorkoutSession session = getOwnedSession(user, sessionId);
        Exercise exercise = exerciseRepository.findById(req.getExerciseId())
                .orElseThrow(() -> FitTrackException.notFound("Exercise"));

        WorkoutExerciseSet set = WorkoutExerciseSet.builder()
                .session(session)
                .exercise(exercise)
                .setNumber(req.getSetNumber())
                .reps(req.getReps())
                .weightKg(req.getWeightKg())
                .durationSeconds(req.getDurationSeconds())
                .restSeconds(req.getRestSeconds())
                .notes(req.getNotes())
                .build();

        // PR detection — compare with previous best set for this exercise
        detectAndMarkPr(set, user.getId(), sessionId);

        set = setRepository.save(set);
        log.info("Set added: exercise={} weight={} reps={} pr={}", exercise.getName(), req.getWeightKg(), req.getReps(), set.getIsPr());
        return toSetResponse(set);
    }

    @Transactional
    public WorkoutSetResponse updateSet(User user, Long sessionId, Long setId, ExerciseSetRequest req) {
        getOwnedSession(user, sessionId); // authorization check
        WorkoutExerciseSet set = setRepository.findById(setId)
                .orElseThrow(() -> FitTrackException.notFound("Exercise set"));
        if (!set.getSession().getId().equals(sessionId))
            throw FitTrackException.forbidden("Set does not belong to this session");

        if (req.getReps() != null) set.setReps(req.getReps());
        if (req.getWeightKg() != null) set.setWeightKg(req.getWeightKg());
        if (req.getDurationSeconds() != null) set.setDurationSeconds(req.getDurationSeconds());
        if (req.getRestSeconds() != null) set.setRestSeconds(req.getRestSeconds());
        if (req.getNotes() != null) set.setNotes(req.getNotes());

        detectAndMarkPr(set, user.getId(), sessionId);
        return toSetResponse(setRepository.save(set));
    }

    @Transactional
    public void deleteSet(User user, Long sessionId, Long setId) {
        WorkoutSession session = getOwnedSession(user, sessionId);
        WorkoutExerciseSet set = setRepository.findById(setId)
                .orElseThrow(() -> FitTrackException.notFound("Exercise set"));
        if (!set.getSession().getId().equals(session.getId())) {
            throw FitTrackException.forbidden("Set does not belong to this session");
        }
        setRepository.delete(set);
    }

    // ── PR Detection ──────────────────────────────────────────────────────

    private void detectAndMarkPr(WorkoutExerciseSet newSet, Long userId, Long currentSessionId) {
        if (newSet.getWeightKg() == null || newSet.getReps() == null) return;

        // Get the best set from previous sessions (returns List, take first)
        Optional<WorkoutExerciseSet> previousBest = setRepository.findPreviousBestSet(
                userId, newSet.getExercise().getId(), currentSessionId, PageRequest.of(0, 1))
                .stream().findFirst();

        if (previousBest.isEmpty()) {
            newSet.setIsPr(false);
        } else {
            double previousE1rm = previousBest.get().estimatedOneRepMax().doubleValue();
            double newE1rm = newSet.estimatedOneRepMax().doubleValue();
            newSet.setIsPr(newE1rm > previousE1rm);
        }
    }

    private WorkoutSession getOwnedSession(User user, Long sessionId) {
        WorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> FitTrackException.notFound("Workout session"));
        if (!session.getUser().getId().equals(user.getId()))
            throw FitTrackException.forbidden("You do not have access to this session");
        return session;
    }

    public WorkoutSessionResponse toSessionResponse(WorkoutSession s) {
        List<WorkoutSetResponse> setResponses = new ArrayList<>();
        BigDecimal totalVolume = BigDecimal.ZERO;

        if (s.getSets() != null) {
            for (WorkoutExerciseSet set : s.getSets()) {
                WorkoutSetResponse sr = toSetResponse(set);
                setResponses.add(sr);
                if (sr.getVolumeKg() != null) {
                    totalVolume = totalVolume.add(sr.getVolumeKg());
                }
            }
        }

        return WorkoutSessionResponse.builder()
                .id(s.getId())
                .sessionDate(s.getSessionDate())
                .name(s.getName())
                .notes(s.getNotes())
                .durationMinutes(s.getDurationMinutes())
                .startedAt(s.getStartedAt())
                .endedAt(s.getEndedAt())
                .totalSets(setResponses.size())
                .totalVolumeKg(totalVolume)
                .sets(setResponses)
                .build();
    }

    public WorkoutSetResponse toSetResponse(WorkoutExerciseSet set) {
        return WorkoutSetResponse.builder()
                .id(set.getId())
                .sessionId(set.getSession() != null ? set.getSession().getId() : null)
                .exerciseId(set.getExercise() != null ? set.getExercise().getId() : null)
                .exerciseName(set.getExercise() != null ? set.getExercise().getName() : null)
                .muscleGroup(set.getExercise() != null && set.getExercise().getMuscleGroup() != null ? set.getExercise().getMuscleGroup().name() : null)
                .setNumber(set.getSetNumber())
                .reps(set.getReps())
                .weightKg(set.getWeightKg())
                .durationSeconds(set.getDurationSeconds())
                .restSeconds(set.getRestSeconds())
                .isPr(set.getIsPr())
                .estimated1RM(set.estimatedOneRepMax())
                .volumeKg(set.volume())
                .notes(set.getNotes())
                .build();
    }
}
