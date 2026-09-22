package com.fittrack.service;

import com.fittrack.dto.request.WaterLogRequest;
import com.fittrack.dto.response.WaterLogResponse;
import com.fittrack.dto.response.WaterSummaryResponse;
import com.fittrack.entity.User;
import com.fittrack.entity.UserProfile;
import com.fittrack.entity.WaterLog;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.repository.WaterLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class WaterService {

    private final WaterLogRepository waterLogRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public WaterSummaryResponse getWaterSummary(User user, LocalDate date) {
        List<WaterLogResponse> logs = waterLogRepository.findByUserIdAndLogDateOrderByLoggedAtAsc(user.getId(), date)
                .stream().map(this::toResponse).collect(Collectors.toList());

        Integer total = waterLogRepository.sumAmountByUserIdAndDate(user.getId(), date);
        int totalMl = total != null ? total : 0;

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        int targetMl = profile != null && profile.getDailyWaterTargetMl() != null ? profile.getDailyWaterTargetMl() : 2500;

        double pct = targetMl > 0 ? Math.min(100.0, (totalMl / (double) targetMl) * 100.0) : 0.0;

        return WaterSummaryResponse.builder()
                .date(date)
                .totalMl(totalMl)
                .targetMl(targetMl)
                .progressPercentage(Math.round(pct * 10.0) / 10.0)
                .logs(logs)
                .build();
    }

    @Transactional
    public WaterLogResponse logWater(User user, WaterLogRequest req) {
        WaterLog log = WaterLog.builder()
                .user(user)
                .logDate(req.getLogDate())
                .amountMl(req.getAmountMl())
                .build();
        return toResponse(waterLogRepository.save(log));
    }

    @Transactional
    public void deleteLog(User user, Long logId) {
        WaterLog log = waterLogRepository.findById(logId)
                .orElseThrow(() -> FitTrackException.notFound("Water log"));
        if (!log.getUser().getId().equals(user.getId()))
            throw FitTrackException.forbidden("You do not have access to this water log");
        waterLogRepository.delete(log);
    }

    /** Returns daily totals for the last N days as [[date, totalMl], ...] */
    @Transactional(readOnly = true)
    public List<Object[]> getWeeklyTotals(User user) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);
        return waterLogRepository.dailyTotalsByDateRange(user.getId(), from, to);
    }

    public WaterLogResponse toResponse(WaterLog log) {
        return WaterLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .amountMl(log.getAmountMl())
                .loggedAt(log.getLoggedAt())
                .build();
    }
}
