package com.fittrack.service;

import com.fittrack.dto.request.SleepLogRequest;
import com.fittrack.dto.response.SleepResponse;
import com.fittrack.entity.SleepLog;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.SleepLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class SleepService {

    private final SleepLogRepository sleepLogRepository;

    @Transactional(readOnly = true)
    public Optional<SleepResponse> getLogForDate(User user, LocalDate date) {
        return sleepLogRepository.findByUserIdAndLogDate(user.getId(), date).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SleepResponse> getLogsForRange(User user, LocalDate from, LocalDate to) {
        return sleepLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), from, to)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SleepResponse logSleep(User user, SleepLogRequest req) {
        // Delete existing entry for same date if present
        sleepLogRepository.findByUserIdAndLogDate(user.getId(), req.getLogDate())
                .ifPresent(sleepLogRepository::delete);

        SleepLog log = SleepLog.builder()
                .user(user)
                .logDate(req.getLogDate())
                .sleepTime(req.getSleepTime())
                .wakeTime(req.getWakeTime())
                .quality(req.getQuality())
                .notes(req.getNotes())
                .build();
        log.computeDuration();
        return toResponse(sleepLogRepository.save(log));
    }

    @Transactional
    public SleepResponse updateLog(User user, Long logId, SleepLogRequest req) {
        SleepLog log = getOwnedLog(user, logId);
        log.setSleepTime(req.getSleepTime());
        log.setWakeTime(req.getWakeTime());
        log.setQuality(req.getQuality());
        log.setNotes(req.getNotes());
        log.computeDuration();
        return toResponse(sleepLogRepository.save(log));
    }

    @Transactional
    public void deleteLog(User user, Long logId) {
        SleepLog log = getOwnedLog(user, logId);
        sleepLogRepository.delete(log);
    }

    private SleepLog getOwnedLog(User user, Long logId) {
        SleepLog log = sleepLogRepository.findById(logId)
                .orElseThrow(() -> FitTrackException.notFound("Sleep log"));
        if (!log.getUser().getId().equals(user.getId()))
            throw FitTrackException.forbidden("You do not have access to this sleep log");
        return log;
    }

    public SleepResponse toResponse(SleepLog log) {
        return SleepResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .sleepTime(log.getSleepTime())
                .wakeTime(log.getWakeTime())
                .durationHours(log.getDurationHours())
                .quality(log.getQuality())
                .notes(log.getNotes())
                .build();
    }
}
