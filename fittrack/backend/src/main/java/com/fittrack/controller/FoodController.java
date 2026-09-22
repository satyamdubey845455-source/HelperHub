package com.fittrack.controller;

import com.fittrack.dto.request.FoodRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.FoodResponse;
import com.fittrack.entity.User;
import com.fittrack.service.FoodService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private final SecurityContextUtil securityContextUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodResponse>>> searchFoods(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "category", required = false) String category) {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Foods retrieved", foodService.searchFoods(user, query, category)));
    }

    @PostMapping("/custom")
    public ResponseEntity<ApiResponse<FoodResponse>> createCustomFood(@Valid @RequestBody FoodRequest request) {
        User user = securityContextUtil.getCurrentUser();
        FoodResponse response = foodService.createCustomFood(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Custom food created", response));
    }

    @GetMapping("/custom")
    public ResponseEntity<ApiResponse<List<FoodResponse>>> getCustomFoods() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Custom foods retrieved", foodService.getCustomFoods(user)));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<FoodResponse>>> getFavorites() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Favorite foods retrieved", foodService.getFavorites(user)));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Void>> toggleFavorite(@PathVariable Long id) {
        User user = securityContextUtil.getCurrentUser();
        foodService.toggleFavorite(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Favorite updated", null));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<FoodResponse>>> getRecentFoods() {
        User user = securityContextUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Recent foods retrieved", foodService.getRecentFoods(user)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories retrieved", foodService.getCategories()));
    }
}
