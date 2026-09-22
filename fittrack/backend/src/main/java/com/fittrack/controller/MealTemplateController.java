package com.fittrack.controller;

import com.fittrack.dto.request.MealTemplateRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.MealTemplateResponse;
import com.fittrack.entity.User;
import com.fittrack.service.MealTemplateService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals/templates")
@RequiredArgsConstructor
public class MealTemplateController {

    private final MealTemplateService mealTemplateService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealTemplateResponse>>> getTemplates() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Meal templates retrieved", mealTemplateService.getTemplates(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MealTemplateResponse>> createTemplate(
            @Valid @RequestBody MealTemplateRequest request) {
        User user = securityContextUtil.getCurrentUser();
        MealTemplateResponse response = mealTemplateService.createTemplate(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Meal template saved", response));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Void>> applyTemplate(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        mealTemplateService.applyTemplate(user, id, targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Template added to meals for " + targetDate, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        mealTemplateService.deleteTemplate(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Template deleted", null));
    }
}
