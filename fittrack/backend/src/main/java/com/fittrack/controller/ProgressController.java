package com.fittrack.controller;

import com.fittrack.dto.request.BodyMeasurementRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.MeasurementResponse;
import com.fittrack.entity.BodyMeasurement;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.BodyMeasurementRepository;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final BodyMeasurementRepository measurementRepository;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MeasurementResponse>>> getAll() {
        User user = securityContextUtil.getCurrentUser();
        List<MeasurementResponse> list = measurementRepository.findByUserIdOrderByLogDateDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Measurements retrieved", list));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<MeasurementResponse>>> getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        User user = securityContextUtil.getCurrentUser();
        List<MeasurementResponse> list = measurementRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(user.getId(), from, to)
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Measurements for range", list));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<MeasurementResponse>> getLatest() {
        User user = securityContextUtil.getCurrentUser();
        MeasurementResponse response = measurementRepository.findTopByUserIdOrderByLogDateDesc(user.getId())
                .map(this::toResponse).orElse(null);
        return ResponseEntity.ok(ApiResponse.ok("Latest measurement", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeasurementResponse>> log(@Valid @RequestBody BodyMeasurementRequest req) {
        User user = securityContextUtil.getCurrentUser();

        // Upsert by date
        BodyMeasurement bm = measurementRepository.findByUserIdAndDate(user.getId(), req.getLogDate())
                .orElse(BodyMeasurement.builder().user(user).logDate(req.getLogDate()).build());

        bm.setWeightKg(req.getWeightKg());
        bm.setWaistCm(req.getWaistCm());
        bm.setChestCm(req.getChestCm());
        bm.setArmCm(req.getArmCm());
        bm.setThighCm(req.getThighCm());
        bm.setBodyFatPct(req.getBodyFatPct());
        bm.setNotes(req.getNotes());

        bm = measurementRepository.save(bm);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Measurement saved", toResponse(bm)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        BodyMeasurement bm = measurementRepository.findById(id)
                .orElseThrow(() -> FitTrackException.notFound("Measurement"));
        if (!bm.getUser().getId().equals(user.getId()))
            throw FitTrackException.forbidden("You do not have access to this measurement");
        measurementRepository.delete(bm);
        return ResponseEntity.ok(ApiResponse.ok("Measurement deleted", null));
    }

    private MeasurementResponse toResponse(BodyMeasurement bm) {
        return MeasurementResponse.builder()
                .id(bm.getId())
                .logDate(bm.getLogDate())
                .weightKg(bm.getWeightKg())
                .waistCm(bm.getWaistCm())
                .chestCm(bm.getChestCm())
                .armCm(bm.getArmCm())
                .thighCm(bm.getThighCm())
                .bodyFatPct(bm.getBodyFatPct())
                .notes(bm.getNotes())
                .build();
    }
}
