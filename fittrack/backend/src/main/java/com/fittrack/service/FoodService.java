package com.fittrack.service;

import com.fittrack.dto.request.FoodRequest;
import com.fittrack.dto.response.FoodResponse;
import com.fittrack.entity.Food;
import com.fittrack.entity.User;
import com.fittrack.entity.UserFavoriteFood;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.FoodRepository;
import com.fittrack.repository.UserFavoriteFoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final UserFavoriteFoodRepository favoriteFoodRepository;

    @Transactional(readOnly = true)
    public List<FoodResponse> searchFoods(User user, String query, String category) {
        Long userId = user != null ? user.getId() : -1L;
        List<Food> foods = foodRepository.searchFoodsWithFilter(
                query != null ? query.trim() : null,
                category != null ? category.trim() : null,
                userId
        );

        Set<Long> favoriteFoodIds = user != null ?
                favoriteFoodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                        .map(fav -> fav.getFood().getId())
                        .collect(Collectors.toSet()) : new HashSet<>();

        return foods.stream()
                .map(f -> toResponse(f, favoriteFoodIds.contains(f.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodResponse> getFavorites(User user) {
        return favoriteFoodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(fav -> toResponse(fav.getFood(), true))
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleFavorite(User user, Long foodId) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> FitTrackException.notFound("Food"));

        if (favoriteFoodRepository.existsByUserIdAndFoodId(user.getId(), foodId)) {
            favoriteFoodRepository.deleteByUserIdAndFoodId(user.getId(), foodId);
        } else {
            UserFavoriteFood fav = UserFavoriteFood.builder()
                    .user(user)
                    .food(food)
                    .build();
            favoriteFoodRepository.save(fav);
        }
    }

    @Transactional(readOnly = true)
    public List<FoodResponse> getCustomFoods(User user) {
        Set<Long> favIds = favoriteFoodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(fav -> fav.getFood().getId())
                .collect(Collectors.toSet());

        return foodRepository.findCustomFoodsByUserId(user.getId()).stream()
                .map(f -> toResponse(f, favIds.contains(f.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodResponse> getRecentFoods(User user) {
        Set<Long> favIds = favoriteFoodRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(fav -> fav.getFood().getId())
                .collect(Collectors.toSet());

        return foodRepository.findRecentlyLoggedFoods(user.getId()).stream()
                .limit(15)
                .map(f -> toResponse(f, favIds.contains(f.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return foodRepository.findDistinctCategories();
    }

    @Transactional
    public FoodResponse createCustomFood(User user, FoodRequest req) {
        Food food = Food.builder()
                .name(req.getName())
                .category(req.getCategory() != null ? req.getCategory() : "Custom")
                .servingSizeG(req.getServingSizeG() != null ? req.getServingSizeG() : BigDecimal.valueOf(100))
                .servingSizeUnit(req.getServingSizeUnit() != null ? req.getServingSizeUnit() : "g")
                .caloriesPerServing(req.getCaloriesPerServing())
                .proteinG(req.getProteinG())
                .carbsG(req.getCarbsG())
                .fatG(req.getFatG())
                .fiberG(req.getFiberG() != null ? req.getFiberG() : BigDecimal.ZERO)
                .sugarG(req.getSugarG() != null ? req.getSugarG() : BigDecimal.ZERO)
                .addedSugarG(req.getAddedSugarG() != null ? req.getAddedSugarG() : BigDecimal.ZERO)
                .saturatedFatG(req.getSaturatedFatG())
                .sodiumMg(req.getSodiumMg() != null ? req.getSodiumMg() : BigDecimal.ZERO)
                .cholesterolMg(req.getCholesterolMg())
                .calciumMg(req.getCalciumMg())
                .ironMg(req.getIronMg())
                .vitaminDMicrog(req.getVitaminDMicrog())
                .vitaminB12Microg(req.getVitaminB12Microg())
                .source("User Created")
                .verified(false)
                .isCustom(true)
                .createdBy(user)
                .build();

        return toResponse(foodRepository.save(food), false);
    }

    public FoodResponse toResponse(Food f, boolean isFavorite) {
        return FoodResponse.builder()
                .id(f.getId())
                .name(f.getName())
                .category(f.getCategory())
                .servingSizeG(f.getServingSizeG())
                .servingSizeUnit(f.getServingSizeUnit())
                .caloriesPerServing(f.getCaloriesPerServing())
                .proteinG(f.getProteinG())
                .carbsG(f.getCarbsG())
                .fatG(f.getFatG())
                .fiberG(f.getFiberG())
                .sugarG(f.getSugarG())
                .addedSugarG(f.getAddedSugarG())
                .saturatedFatG(f.getSaturatedFatG())
                .sodiumMg(f.getSodiumMg())
                .cholesterolMg(f.getCholesterolMg())
                .calciumMg(f.getCalciumMg())
                .ironMg(f.getIronMg())
                .vitaminDMicrog(f.getVitaminDMicrog())
                .vitaminB12Microg(f.getVitaminB12Microg())
                .source(f.getSource())
                .verified(f.getVerified())
                .isCustom(f.getIsCustom())
                .isFavorite(isFavorite)
                .createdByUserId(f.getCreatedBy() != null ? f.getCreatedBy().getId() : null)
                .build();
    }
}
