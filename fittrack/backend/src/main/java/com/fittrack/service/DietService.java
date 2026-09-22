package com.fittrack.service;

import com.fittrack.dto.request.MealItemRequest;
import com.fittrack.dto.request.MealRequest;
import com.fittrack.dto.response.MealResponse;
import com.fittrack.dto.response.MealResponse.MealItemResponse;
import com.fittrack.entity.*;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class DietService {

    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;

    @Transactional(readOnly = true)
    public List<MealResponse> getMealsForDate(User user, LocalDate date) {
        return mealRepository.findByUserIdAndLogDateWithItems(user.getId(), date)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MealResponse createMeal(User user, MealRequest req) {
        // If meal of this type already exists today, return it
        return mealRepository.findByUserIdAndLogDateAndMealType(user.getId(), req.getLogDate(), req.getMealType())
                .map(this::toResponse)
                .orElseGet(() -> {
                    Meal meal = Meal.builder()
                            .user(user)
                            .logDate(req.getLogDate())
                            .mealType(req.getMealType())
                            .notes(req.getNotes())
                            .build();
                    return toResponse(mealRepository.save(meal));
                });
    }

    @Transactional
    public MealResponse addItemToMeal(User user, Long mealId, MealItemRequest req) {
        Meal meal = getMealOwnedByUser(user.getId(), mealId);
        Food food = foodRepository.findById(req.getFoodId())
                .orElseThrow(() -> FitTrackException.notFound("Food"));

        MealItem item = MealItem.builder()
                .meal(meal)
                .food(food)
                .quantity(req.getQuantity())
                .unit(req.getUnit() != null ? req.getUnit() : food.getServingSizeUnit())
                .build();
        item.computeNutrition();
        meal.getItems().add(item);

        return toResponse(mealRepository.save(meal));
    }

    @Transactional
    public MealResponse updateMealItem(User user, Long mealId, Long itemId, MealItemRequest req) {
        Meal meal = getMealOwnedByUser(user.getId(), mealId);
        MealItem item = meal.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> FitTrackException.notFound("Meal item"));

        if (req.getFoodId() != null && !req.getFoodId().equals(item.getFood().getId())) {
            Food food = foodRepository.findById(req.getFoodId())
                    .orElseThrow(() -> FitTrackException.notFound("Food"));
            item.setFood(food);
        }
        if (req.getQuantity() != null) item.setQuantity(req.getQuantity());
        if (req.getUnit() != null) item.setUnit(req.getUnit());
        item.computeNutrition();

        return toResponse(mealRepository.save(meal));
    }

    @Transactional
    public void deleteMealItem(User user, Long mealId, Long itemId) {
        Meal meal = getMealOwnedByUser(user.getId(), mealId);
        meal.getItems().removeIf(i -> i.getId().equals(itemId));
        mealRepository.save(meal);
    }

    @Transactional
    public void deleteMeal(User user, Long mealId) {
        Meal meal = getMealOwnedByUser(user.getId(), mealId);
        mealRepository.delete(meal);
    }

    // ── Nutrition Totals ──────────────────────────────────────────────────

    public MealResponse.DailyNutritionTotals getDailyTotals(User user, LocalDate date) {
        List<Meal> meals = mealRepository.findByUserIdAndLogDateWithItems(user.getId(), date);
        BigDecimal cal = BigDecimal.ZERO, prot = BigDecimal.ZERO,
                   carbs = BigDecimal.ZERO, fat = BigDecimal.ZERO, fiber = BigDecimal.ZERO,
                   sugar = BigDecimal.ZERO, addedSugar = BigDecimal.ZERO, sodium = BigDecimal.ZERO;

        for (Meal m : meals) {
            for (MealItem item : m.getItems()) {
                cal        = cal.add(orZero(item.getCaloriesConsumed()));
                prot       = prot.add(orZero(item.getProteinConsumed()));
                carbs      = carbs.add(orZero(item.getCarbsConsumed()));
                fat        = fat.add(orZero(item.getFatConsumed()));
                fiber      = fiber.add(orZero(item.getFiberConsumed()));
                sugar      = sugar.add(orZero(item.getSugarConsumed()));
                addedSugar = addedSugar.add(orZero(item.getAddedSugarConsumed()));
                sodium     = sodium.add(orZero(item.getSodiumConsumed()));
            }
        }
        return MealResponse.DailyNutritionTotals.builder()
                .date(date).totalCalories(cal).totalProtein(prot)
                .totalCarbs(carbs).totalFat(fat).totalFiber(fiber)
                .totalSugar(sugar).totalAddedSugar(addedSugar).totalSodium(sodium)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Meal getMealOwnedByUser(Long userId, Long mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> FitTrackException.notFound("Meal"));
        if (!meal.getUser().getId().equals(userId))
            throw FitTrackException.forbidden("You do not have access to this meal");
        return meal;
    }

    private MealResponse toResponse(Meal meal) {
        BigDecimal cal = BigDecimal.ZERO, prot = BigDecimal.ZERO,
                   carbs = BigDecimal.ZERO, fat = BigDecimal.ZERO, fiber = BigDecimal.ZERO,
                   sugar = BigDecimal.ZERO, addedSugar = BigDecimal.ZERO, sodium = BigDecimal.ZERO;

        List<MealItemResponse> items = meal.getItems().stream().map(item -> {
            return MealItemResponse.builder()
                    .id(item.getId())
                    .foodId(item.getFood().getId())
                    .foodName(item.getFood().getName())
                    .servingSizeUnit(item.getFood().getServingSizeUnit())
                    .quantity(item.getQuantity())
                    .unit(item.getUnit())
                    .caloriesConsumed(item.getCaloriesConsumed())
                    .proteinConsumed(item.getProteinConsumed())
                    .carbsConsumed(item.getCarbsConsumed())
                    .fatConsumed(item.getFatConsumed())
                    .fiberConsumed(item.getFiberConsumed())
                    .sugarConsumed(item.getSugarConsumed())
                    .addedSugarConsumed(item.getAddedSugarConsumed())
                    .sodiumConsumed(item.getSodiumConsumed())
                    .build();
        }).collect(Collectors.toList());

        for (MealItemResponse i : items) {
            cal        = cal.add(orZero(i.getCaloriesConsumed()));
            prot       = prot.add(orZero(i.getProteinConsumed()));
            carbs      = carbs.add(orZero(i.getCarbsConsumed()));
            fat        = fat.add(orZero(i.getFatConsumed()));
            fiber      = fiber.add(orZero(i.getFiberConsumed()));
            sugar      = sugar.add(orZero(i.getSugarConsumed()));
            addedSugar = addedSugar.add(orZero(i.getAddedSugarConsumed()));
            sodium     = sodium.add(orZero(i.getSodiumConsumed()));
        }

        return MealResponse.builder()
                .id(meal.getId())
                .logDate(meal.getLogDate())
                .mealType(meal.getMealType())
                .notes(meal.getNotes())
                .items(items)
                .totalCalories(cal).totalProtein(prot)
                .totalCarbs(carbs).totalFat(fat).totalFiber(fiber)
                .totalSugar(sugar).totalAddedSugar(addedSugar).totalSodium(sodium)
                .build();
    }

    private BigDecimal orZero(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}
