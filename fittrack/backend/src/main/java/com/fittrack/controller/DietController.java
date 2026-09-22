package com.fittrack.controller;

import com.fittrack.dto.request.MealItemRequest;
import com.fittrack.dto.request.MealRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.MealResponse;
import com.fittrack.entity.User;
import com.fittrack.service.DietService;
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
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealResponse>>> getMeals(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Meals retrieved", dietService.getMealsForDate(user, date)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MealResponse.DailyNutritionTotals>> getDailySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Daily nutrition summary", dietService.getDailyTotals(user, date)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MealResponse>> createMeal(@Valid @RequestBody MealRequest request) {
        User user = securityContextUtil.getCurrentUser();
        MealResponse data = dietService.createMeal(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Meal created", data));
    }

    @DeleteMapping("/{mealId}")
    public ResponseEntity<ApiResponse<Void>> deleteMeal(@PathVariable Long mealId) {
        User user = securityContextUtil.getCurrentUser();
        dietService.deleteMeal(user, mealId);
        return ResponseEntity.ok(ApiResponse.ok("Meal deleted", null));
    }

    @PostMapping("/{mealId}/items")
    public ResponseEntity<ApiResponse<MealResponse>> addItem(
            @PathVariable Long mealId, @Valid @RequestBody MealItemRequest request) {
        User user = securityContextUtil.getCurrentUser();
        MealResponse data = dietService.addItemToMeal(user, mealId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Food added to meal", data));
    }

    @PutMapping("/{mealId}/items/{itemId}")
    public ResponseEntity<ApiResponse<MealResponse>> updateItem(
            @PathVariable Long mealId, @PathVariable Long itemId,
            @Valid @RequestBody MealItemRequest request) {
        User user = securityContextUtil.getCurrentUser();
        MealResponse data = dietService.updateMealItem(user, mealId, itemId, request);
        return ResponseEntity.ok(ApiResponse.ok("Meal item updated", data));
    }

    @DeleteMapping("/{mealId}/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long mealId, @PathVariable Long itemId) {
        User user = securityContextUtil.getCurrentUser();
        dietService.deleteMealItem(user, mealId, itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from meal", null));
    }
}
